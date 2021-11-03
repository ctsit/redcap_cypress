describe('Import Project', () => {

    const page = Cypress.env('page');
    const path = Cypress.env('path');
    const projectType = Cypress.env('project_type')
    const moduleName = 'Auto Populate Fields';
    const pid = 15;
    const recordID = 7;

    before(() => {
        cy.set_user_type('admin')
        cy.ui_login()
        cy.visit_version({ page: page.ExternalModules })
        cy.searchAndEnableGlobalModule(moduleName);
    })

    it('asserts module is enabled under Control Center > External Modules', () => {
        cy.getEnabledModuleTableEntry(moduleName).should(($t) => {
            expect($t).to.contain(moduleName)
        })
    })

    describe('Project tests', () => {
        it('asserts project was created from xml', () => {
            const fileName = "auto_populate_fields.xml";
            cy.create_cdisc_project('Auto Populate Fields', projectType.Practice, `${path.cdisc}/${fileName}`, pid)
        })

        it('asserts module was enabled for project', () => {
            cy.visit_version({ page: page.ProjectExternalModules, params: `pid=${pid}` })
            cy.searchAndEnableProjectModule(moduleName);
            cy.getEnabledModuleTableEntry(moduleName).should(($t) => {
                expect($t).to.contain(moduleName)
            })
        })

        describe('Project with chronological event detection off', () => {
            after(() => {
                // cy.visit_version({ page: page.ProjectExternalModules, params: `pid=${pid}` })
            })

            before(() => {
                cy.configureModule(moduleName);
                cy.visit_version({ page: page.RecordStatusDashboard, params: `pid=${pid}` })
                cy.selectRecord(recordID)
            })

            it('asserts that the first instance of a repeat event is auto-populated from the previous saved event/form', () => {
                // 'dose 1' being populated by last entry of 'enrollment'
                let options = {
                    "row": 2,
                    "col": 2,
                    "target": 'event',
                    "instanceType": "nth", // first, last, nth
                    "instance": 3
                }
                cy.selectTableEntry(options);
                
                // visit dose 1

                // cy.saveAndExitForm()
                // cy.leaveFormWithoutSaving()
            })

            // it('asserts that the the first instance of a repeat form is auto-populated from the previous saved event/form', () => {
            //     // 'visit 1' populated by last entry of 'dose 1'
            //     return true;
            // })

            // it('asserts that the the nth instance of a repeat event is auto-populated from the immediate previous instance', () => {
            //     // 'dose 1' instance 2 populated by 'dose 1' instance 1
            //     // 'dose 1' instance 3 populated by 'dose 1' instance 2
            //     return true;
            // })

            // it('asserts that the the nth instance of a repeat form is auto-populated from the immediate previous instance', () => {
            //     // 'enrollment' instance 2 is populated by 'enrollment' instance 1
            //     // 'enrollment' instance 3 is populated by 'enrollment' instance 2
            //     // 'event 4' instance 2 is populated by 'event 4' instance 1
            //     // 'event 4' instance 3 is populated by 'event 4' instance 2
            //     return true;
            // })

            // it('asserts that the that new instances for a repeat event/instrument (having 2+ instances) are auto-populated after deleting (Delete data for THIS FORM only) any form except for last', () => {
            //     // 
            //     return true;
            // })
        })

        // describe('Project with chronological event detection on', () => {
        //     before(() => {
        //         cy.configureModule(moduleName, {
        //             "chronological_previous_event": true
        //         });
        //         cy.visit_version({ page: page.RecordStatusDashboard, params: `pid=${pid}` })
        //         cy.selectRecord(recordID)
        //     })

        //     it('asserts that the first instance of a repeat event is auto-populated from the previous saved event/form', () => {
        //         // 'dose 1' being populated by last entry of 'enrollment'
        //         return true;
        //     })

        //     it('asserts that the the first instance of a repeat form is auto-populated from the previous saved event/form', () => {
        //         // 'visit 1' populated by last entry of 'dose 1'
        //         return true;
        //     })

        //     it('asserts that the the nth instance of a repeat event is auto-populated from the immediate previous instance', () => {
        //         // 'dose 1' instance 2 populated by 'dose 1' instance 1
        //         // 'dose 1' instance 3 populated by 'dose 1' instance 2
        //         return true;
        //     })

        //     it('asserts that the the nth instance of a repeat form is auto-populated from the immediate previous instance', () => {
        //         // 'enrollment' instance 2 is populated by 'enrollment' instance 1
        //         // 'enrollment' instance 3 is populated by 'enrollment' instance 2
        //         // 'event 4' instance 2 is populated by 'event 4' instance 1
        //         // 'event 4' instance 3 is populated by 'event 4' instance 2
        //         return true;
        //     })

        //     it('asserts that the that new instances for a repeat event/instrument (having 2+ instances) are auto-populated after deleting (Delete data for THIS FORM only) any form except for last', () => {
        //         // 
        //         return true;
        //     })
        // })
    })
})
