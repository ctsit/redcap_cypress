import * as util from "./util";

// Commands in this file are CRUCIAL and are an embedded part of the REDCap Cypress Framework.
// They are very stable and do not change often, if ever
Cypress.Commands.add('uiLogin', (username, password) => {
    cy.visit("")
    cy.get('#username').type(username)
    cy.get('#password').type(password)
    cy.get('#login_btn').click()
})

Cypress.Commands.add('login', (options) => {

    cy.clearCookies()

    cy.request({
        method: 'POST',
        url: '/', // baseUrl is prepended to url
        form: true, // indicates the body should be form urlencoded and sets Content-Type: application/x-www-form-urlencoded headers
        body: {
            'username': options['username'],
            'password': options['password'],
            'submitted': 1,
            'redcap_login_a38us_09i85': 'redcap_login_a38us_09i85'
        }
    }).should(($a) => {
        expect($a.status).to.equal(200)
    })
})

Cypress.Commands.add('visitVersion', (options) => {

    let version = Cypress.env('redcap_version')

    // cy.maintainSession().then(() => {
        if ('params' in options) {
            cy.visit('/redcap_v' + version + '/' + options['page'] + '?' + options['params'])
        } else {
            cy.visit('/redcap_v' + version + '/' + options['page'])
        }
    // })
})

Cypress.Commands.add('visitBase', (options) => {
    // cy.maintainSession().then(() => {
        if ('url' in options) cy.visit(options['url'])
    // })
})

Cypress.Commands.add('baseDbSeed', () => {

    let redcap_source_path = Cypress.env('redcap_source_path')

    if (redcap_source_path === undefined) {
        alert('redcap_source_path, which defines where your REDCap source code exists, is missing in cypress.env.json.  Please configure it before proceeding.')
    }

    cy.task('populateStructureAndData', {
        redcap_version: Cypress.env('redcap_version'),
        advanced_user_info: (Cypress.env('redcap_version') >= '10.1.0'),
        source_location: redcap_source_path
    }).then((structure_and_data_file_exists) => {

        //Only run this block if the Structure and Data File exists and has gone through proper processes
        if (structure_and_data_file_exists) {

            //Create the database if it doesn't exist
            cy.mysqlDb('create_database', '', false).then(() => {

                //Pull in the structure and data from REDCap Source
                cy.mysqlDb('structure_and_data', util.baseUrl()).then(() => {

                    if (Cypress.env('redcap_hooks_path') !== undefined) {
                        const redcap_hooks_path = "REDCAP_HOOKS_PATH/" + Cypress.env('redcap_hooks_path').replace(/\//g, "\\/");
                        cy.mysqlDb('hooks_config', redcap_hooks_path) //Fetch the hooks SQL seed data
                    }

                    //Clear out all cookies
                    cy.clearCookies()
                })

            })

        } else {
            alert('Warning: Error generating structure and data file.  This usually happpens because your REDCap source code is missing files.')
        }

    })
})

Cypress.Commands.add('maintainSession', () => {
    // let user = window.user_info.get_current_user()
    // let pass = window.user_info.get_current_pass()

    // let user_type = window.user_info.get_user_type()
    // let previous_user_type = window.user_info.get_previous_user_type()

    // console.log('User Type Change to ' + user_type + '.')
    // console.log('previous: ' + previous_user_type)
    // console.log('current: ' + user_type)

    // if (user_type === previous_user_type) {
        cy.getCookies()
            .should((cookies) => {

                //In most cases, we'll have cookies to preserve to maintain a login
                if (cookies.length > 0) {
                    console.log('Cookie Login')
                    cookies.map(cookie => Cypress.Cookies.preserveOnce(cookie['name']))

                    //But, if we don't, then let's simply re-login, right?    
                } else {
                    console.log('Regular Login')
                    // cy.login({ username: user, password: pass })
                }

            })

        //If user type has changed, let's clear cookies and login again
    // } else {
    //     //Ensure we logout when a user changes
    //     cy.visit('/redcap_v' + Cypress.env('redcap_version') + '/index.php?logout=1')
    //     cy.login({ username: user, password: pass })
    // }

    // window.user_info.set_previous_user_type()
})

// Cypress.Commands.add('set_user_type', (user_type) => {
//     window.user_info.set_user_type(user_type)
// })

// Cypress.Commands.add('set_user_info', (users) => {
//     if (users !== undefined) {
//         window.user_info.set_users(users)
//     } else {
//         alert('users, which defines what users are in your seed database, is missing from cypress.env.json.  Please configure it before proceeding.')
//     }
// })


Cypress.Commands.add('mysqlDb', (type, replace = '', include_db_name = true) => {

    const mysql = Cypress.env("mysql")

    let version = Cypress.env('redcap_version')

    if (version === undefined) {
        alert('redcap_version, which defines what version of REDCap you use in the seed database, is missing from cypress.env.json.  Please configure it before proceeding.')
    }

    //Create the MySQL Installation
    cy.task('generateMySQLCommand', {
        mysql_name: mysql['path'],
        host: mysql['host'],
        port: mysql['port'],
        db_name: mysql['db_name'],
        db_user: mysql['db_user'],
        db_pass: mysql['db_pass'],
        type: type,
        replace: replace,
        include_db_name: include_db_name
    }).then((mysql_cli) => {

        //Execute the MySQL Command
        cy.exec(mysql_cli['cmd'], { timeout: 100000 }).then((data_import) => {
            expect(data_import['code']).to.eq(0)

            //Clean up after ourselves    
            cy.task('deleteFile', { path: mysql_cli['tmp'] }).then((deleted_tmp_file) => {
                expect(deleted_tmp_file).to.eq(true)
            })
        })
    })
})

function test_link(link, title, try_again = true) {
    cy.get('div#control_center_menu a').
        contains(link).
        click().
        then(($control_center) => {
            if ($control_center.find('div#control_center_window').length) {
                cy.get('div#control_center_window').then(($a) => {
                    if ($a.find('div#control_center_window h4').length) {
                        cy.get('div#control_center_window h4').contains(title)
                    } else if ($a.find('div#control_center_window div').length) {
                        cy.get('div#control_center_window div').contains(title)
                    } else {
                        cy.get('body').contains(title)
                    }
                })
            } else {
                cy.get('body').contains(title)
            }
        })
}

Cypress.Commands.add('contains_cc_link', (link, title = '') => {
    if (title == '') title = link
    let t = Cypress.$("div#control_center_menu a:contains(" + JSON.stringify(link) + ")");
    t.length ? test_link(link, title) : test_link(link.split(' ')[0], title.split(' ')[0])
})

Cypress.Commands.add('findOnlineDesignerField', (name, timeout = 10000) => {
    cy.contains('td', name, { timeout: timeout })
})

Cypress.Commands.add('compare_value_by_field_label', (name, value, timeout = 10000) => {
    cy.contains('td', name, { timeout: timeout }).parent().parentsUntil('tr').last().parent().then(($tr) => {
        const name = $tr[0]['attributes']['sq_id']['value']
        cy.get('[name="' + name + '"]').should(($a) => {
            expect($a[0]['value']).to.equal(value)
        })
    })
})

Cypress.Commands.add('getFieldValueByLabel', ($name, $type, $prefix = '', $suffix = '', $last_suffix = '', timeout = 10000) => {
    cy.contains('td', $name, { timeout: timeout }).
        parent().
        parentsUntil('tr').
        last().
        parent().
        then(($tr) => {

            let selector = $type + '[name="' + $prefix + $tr[0]['attributes']['sq_id']['value'] + $suffix + '"]'
            cy.get(selector).then(($a) => {
                return $a[0]
            })
        })
})

Cypress.Commands.add('leaveForm', () => {
    cy.get('#__SUBMITBUTTONS__-div button.btn-defaultrc').contains('Cancel').click()
})

Cypress.Commands.add('saveForm', () => {
    cy.get('#__SUBMITBUTTONS__-div > button#submit-btn-saverecord').contains('Save & Exit Form').click()
})

Cypress.Commands.add('configureModule', (moduleName, settings) => {
    cy.get(`#external-modules-enabled tr[data-module=${util.camelToSnakeCase(moduleName)}] button.external-modules-configure-button`).click()
    // TODO: add support for different setting types
    for (const property in settings) {
        if (settings[property]) {
            cy.get(`tr[field=${property}] input[type='checkbox']`).click()
        }
    }
    cy.get('#external-modules-configure-modal button.save').click()
})

Cypress.Commands.add('selectTableEntry', (config: util.Configurable) => {
    config.selectTargetCell()
})

// Search for and enable an external module
Cypress.Commands.add('searchAndEnableGlobalModule', moduleName => {
    cy.searchForModule(moduleName);
    cy.getDisabledModuleTableEntry(moduleName);
    cy.enableModule(moduleName, false);
})

Cypress.Commands.add('searchAndEnableProjectModule', moduleName => {
    cy.searchForModule(moduleName);
    cy.getDisabledModuleTableEntry(moduleName);
    cy.enableModule(moduleName, true);
})

/// Search for module in the search bar
Cypress.Commands.add('searchForModule', moduleName => {
    cy.get('button').contains('Enable a module').click()
    cy.get("#disabled-modules-search").type(moduleName);
})

/// Attempt to get the disabled module table entry
Cypress.Commands.add('getDisabledModuleTableEntry', moduleName => {
    cy.get('#external-modules-disabled-table td').contains(moduleName)
})

/// Attempt to get the enabled module table entry
Cypress.Commands.add('getEnabledModuleTableEntry', moduleName => {
    cy.get('#external-modules-enabled div.external-modules-title').contains(moduleName)
})

/// Attempt to enable a module
Cypress.Commands.add('enableModule', (moduleName, projectLevel) => {
    cy.get(`#external-modules-disabled-table tr[data-module=${util.camelToSnakeCase(moduleName)}] button.enable-button`).click()
    if (!projectLevel) {
        cy.get('div.modal-footer > button.enable-button').click()
    }
})

Cypress.Commands.add('selectRecord', recordID => {
    cy.get(`#record_status_table a`).contains(recordID).click()

})

Cypress.Commands.add('selectTextByLabel', ($name) => {
    cy.getFieldValueByLabel($name, 'input')
})

Cypress.Commands.add('selectTextAreaByLabel', ($name, $value) => {
    cy.getFieldValueByLabel($name, 'textarea')
})

Cypress.Commands.add('selectRadioByLabel', ($name, $value) => {
    cy.getFieldValueByLabel($name, 'input', '', '___radio')
})

Cypress.Commands.add('selectValueByLabel', ($name, $value) => {
    cy.getFieldValueByLabel($name, 'select', '', '')
})

Cypress.Commands.add('selectCheckboxByLabel', ($name, $value) => {
    cy.getFieldValueByLabel($name, 'input', '__chkn__', '')
})

Cypress.Commands.add('edit_field_by_label', (name, timeout = 10000) => {
    cy.findOnlineDesignerField(name).parent().parentsUntil('tr').find('img[title=Edit]').parent().click()
})

Cypress.Commands.add('selectFieldChoices', (timeout = 10000) => {
    cy.get('form#addFieldForm').children().get('span').contains('Choices').parent().parent().find('textarea')
})

Cypress.Commands.add('initial_saveField', () => {
    cy.get('input#field_name').then(($f) => {
        cy.contains('button', 'Save').
            should('be.visible').
            click().
            then(() => {

                cy.contains('Alert').then(($a: any) => {
                    if ($a.length) {
                        cy.get('button[title=Close]:last:visible').click()
                        cy.get('input#auto_variable_naming').click()
                        cy.contains('button', 'Enable auto naming').click().then(() => {
                            cy.contains('button', 'Save').click()
                        })
                    }
                })
            })
    })
})

Cypress.Commands.add('saveField', () => {
    cy.get('input#field_name').then(($f) => {
        cy.contains('button', 'Save').click()
    })

})

Cypress.Commands.add('add_field', (field_name, type) => {
    cy.get('input#btn-last').click().then(() => {
        cy.get('select#field_type').select(type).should('have.value', type).then(() => {
            cy.get('input#field_name').type(field_name).then(() => {
                cy.saveField()
                cy.findOnlineDesignerField(field_name)
            })
        })
    })
})

// Cypress.Commands.add('require_redcap_stats', () => {
//     cy.server()
//     cy.route({ method: 'POST', url: '**/ProjectGeneral/project_stats_ajax.php' }).as('project_stats_ajax')
//     cy.wait('@project_stats_ajax').then((xhr, error) => { })
// })

Cypress.Commands.add('get_project_table_row_col', (row = '1', col = '0') => {
    cy.get('table#table-proj_table tr:nth-child(' + row + ') td:nth-child(' + col + ')')
})

Cypress.Commands.add('uploadFile', (fileName, fileType = ' ', selector) => {
    cy.get(selector).then(subject => {
        cy.fixture(fileName, 'base64')
            .then(Cypress.Blob.base64StringToBlob)
            .then(blob => {
                const el = subject[0]
                const testFile = new File([blob], fileName, { type: fileType })
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(testFile)
                el.files = dataTransfer.files
            })
    })
})


Cypress.Commands.add('upload_data_dictionary', (fixture_file, pid, date_format = "DMY") => {

    let admin_user = Cypress.env('users')['admin']['user']
    let current_token = null;

    cy.maintainSession().then(($r) => {

        cy.addApiUserToProject(admin_user, pid).then(() => {

            cy.request({
                url: '/redcap_v' +
                    Cypress.env('redcap_version') +
                    '/ControlCenter/user_api_ajax.php?action=createToken&api_username=' +
                    admin_user +
                    '&api_pid=' +
                    pid +
                    '&api_export=1&api_import=1&mobile_app=0&api_send_email=0'
            }).should(($token) => {

                expect($token.body).to.contain('token has been created')
                expect($token.body).to.contain(admin_user)

                cy.request({
                    url: '/redcap_v' +
                        Cypress.env('redcap_version') +
                        '/ControlCenter/user_api_ajax.php?action=viewToken&api_username=test_admin&api_pid=' + pid
                }).then(($super_token) => {

                    current_token = Cypress.$($super_token.body).children('div')[0].innerText

                    cy.fixture(`dictionaries/${fixture_file}`).then(data_dictionary => {

                        cy.request({
                            method: 'POST',
                            url: '/api/',
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: {
                                token: current_token,
                                content: 'metadata',
                                format: 'csv',
                                data: data_dictionary,
                                returnFormat: 'json'
                            },
                            timeout: 50000

                        }).should(($a) => {
                            expect($a.status).to.equal(200)

                            cy.request('/redcap_v' + Cypress.env('redcap_version') + '/Logging/index.php?pid=' + pid).should(($e) => {
                                expect($e.body).to.contain('List of Data Changes')
                                expect($e.body).to.contain('Manage/Design')
                            })
                        })
                    })
                })
            })
        })
    })

})

Cypress.Commands.add('createCdiscProject', (project_name, project_type, cdisc_file, project_id) => {
    //Set the Desired Project ID
    const desired_pid = 'MAGIC_AUTO_NUMBER/' + project_id;
    cy.mysqlDb('set_auto_increment_value', desired_pid)

    //Run through the steps to import the project via CDISC ODM
    cy.visitBase({ url: 'index.php?action=create' })
    cy.get('input#app_title').type(project_name)
    cy.get('select#purpose').select(project_type)
    cy.get('input#project_template_radio2').click()
    cy.uploadFile(cdisc_file, 'xml', 'input[name="odm"]')
    cy.get('button').contains('Create Project').click().then(() => {
        let pid = null;
        cy.url().should((url) => {
            return url
        })
    })
})

Cypress.Commands.add('addApiUserToProject', (username, pid) => {
    cy.visitVersion({ page: 'UserRights/index.php', params: 'pid=' + pid }).then(() => {
        cy.get('input#new_username').clear({ force: true }).type(username, { force: true }).then((element) => {
            cy.get('button').contains('Add with custom rights').click({ force: true }).then(() => {
                cy.get('input[name=api_export]').click()
                cy.get('input[name=api_import]').click()
                cy.get('.ui-button').contains(/add user|save changes/i).click().then(() => {
                    cy.get('table#table-user_rights_roles_table').should(($e) => {
                        expect($e[0].innerText).to.contain(username)
                    })
                })
            })
        })
    })
})

Cypress.Commands.add('mysqlQuery', (query) => {
    const mysql = Cypress.env("mysql")

    const cmd = `${mysql['path']} -h${mysql['host']} --port=${mysql['port']} ${mysql['db_name']} -u${mysql['db_user']} -p${mysql['db_pass']} -e "${query}" -N -s`

    cy.exec(cmd, { timeout: 100000 }).then((response) => {
        expect(response['code']).to.eq(0)
        return response['stdout']
    })
})

Cypress.Commands.add('num_projects_excluding_archived', () => {
    return cy.mysqlQuery("SELECT count(*) FROM redcap_projects WHERE status != 3;")
})

Cypress.Commands.add('delete_project', (pid) => {
    cy.visitVersion({ page: 'ProjectSetup/other_functionality.php', params: `pid=${pid}` })
    cy.get('button').contains('Delete the project').click()
    cy.get('input#delete_project_confirm').type('DELETE').then((input) => {
        cy.get(input.toString()).closest('div[role="dialog"]').find('button').contains('Delete the project').click()
        cy.get('button').contains('Yes, delete the project').click()
        cy.get('span#ui-id-3').closest('div[role="dialog"]').find('button').contains('Close').click({ force: true })
    })
})

Cypress.Commands.add('delete_project_complete', (pid) => {
    cy.mysqlQuery(`START TRANSACTION;

        USE \`REDCAP_DB_NAME\`;
        SET AUTOCOMMIT=0;
        SET UNIQUE_CHECKS=0;
        SET FOREIGN_KEY_CHECKS=0;

        DELETE FROM redcap_data WHERE project_id = ${pid};
        DELETE FROM redcap_record_list WHERE project_id = ${pid};
        DELETE FROM redcap_record_counts WHERE project_id = ${pid};
        DELETE FROM redcap_user_rights WHERE project_id = ${pid};
        DELETE FROM redcap_projects WHERE project_id = ${pid};

        COMMIT;`
    )
})

Cypress.Commands.add('delete_records', (pid) => {
    cy.visitVersion({ page: 'ProjectSetup/other_functionality.php', params: `pid=${pid}` })
    cy.get('button').contains('Erase all data').click({ force: true })
    cy.get('div[role="dialog"]').find('button').contains('Erase all data').click({ force: true })
    cy.get('span#ui-id-2').closest('div[role="dialog"]').find('button').contains('Close').click({ force: true })
})

Cypress.Commands.add('access_api_token', (pid, user) => {
    // This assumes user already has API token created
    cy.maintainSession().then(($r) => {
        cy.request({ url: `/redcap_v${Cypress.env('redcap_version')}/ControlCenter/user_api_ajax.php?action=viewToken&api_pid=${pid}&api_username=${user}` })
            .then(($token) => {
                return cy.wrap(Cypress.$($token.body).children('div')[0].innerText);
            })
    })
})

Cypress.Commands.add('import_data_file', (fixture_file, api_token) => {

    cy.fixture(`import_files/${fixture_file}`).then(import_data => {

        cy.request({
            method: 'POST',
            url: '/api/',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: {
                token: api_token,
                content: 'record',
                format: 'csv',
                type: 'flat',
                data: import_data,
                returnFormat: 'json'
            },
            timeout: 50000
        }).should(($a) => {
            expect($a.status).to.equal(200)
        })

    })

})

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
