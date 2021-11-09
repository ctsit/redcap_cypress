import { NewInstanceConfig, InstanceType, InstanceConfig, EventConfig, NewEventConfig } from "../../../support/util";

describe('Import Project', () => {

    const moduleName = 'Auto Populate Fields';

    const Page = Cypress.env('page');
    const Path = Cypress.env('path');
    const ProjectType = Cypress.env('projectType')
    const pid = 15;
    const recordID = 7;

    before(() => {
        // cy.set_user_type('admin')
        cy.uiLogin("test_admin", "Testing123")
        cy.visitVersion({ page: Page.ExternalModules })
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
            cy.createCdiscProject('Auto Populate Fields', ProjectType.Practice, `${Path.cdisc}/${fileName}`, pid)
        })

        it('asserts module was enabled for project', () => {
            cy.visitVersion({ page: Page.ProjectExternalModules, params: `pid=${pid}` })
            cy.searchAndEnableProjectModule(moduleName);
            cy.getEnabledModuleTableEntry(moduleName).should(($t) => {
                expect($t).to.contain(moduleName)
            })
        })

        describe('Project with chronological event detection off', () => {
            after(() => {
                // cy.visitVersion({ page: Page.ProjectExternalModules, params: `pid=${pid}` })
            })

            before(() => {
                cy.configureModule(moduleName);
            })

            beforeEach(() => {
                cy.visitVersion({ page: Page.RecordStatusDashboard, params: `pid=${pid}` })
                cy.selectRecord(recordID)
            })

            it('asserts that the first instance of a repeat event is auto-populated from the previous saved event/form', () => {
                // 'dose 1' being populated by last entry of 'enrollment'

                // get the height from 'enrollment'
                const instanceConfig = new InstanceConfig({col: 1, row: 2, instanceType: InstanceType.Last});
                cy.selectTableEntry(instanceConfig);

                let enrollmentHeight;
                let enrollmentHeightChain = () => {
                    return cy.selectTextByLabel('Height (cm)')
                        .invoke('val')
                        .then((val) => {
                            return val;
                        });
                }
                enrollmentHeightChain().then(height => {
                    enrollmentHeight = height;
                    cy.leaveForm()
                    console.log('enrollment height for last instance', height)
                })


                // get the height from 'dose 1'
                const eventConfig = new EventConfig({col: 2, row: 2});
                cy.selectTableEntry(eventConfig);

                let doseHeightChain = () => {
                    return cy.selectTextByLabel('Height (cm)')
                        .invoke('val')
                        .then((val) => {
                            return val;
                        });
                }
                doseHeightChain().then(height => {
                    expect(enrollmentHeight).to.equal(height)
                })
            })

            it('asserts that the first instance of a repeat event is auto-populated from a newly created event/form', () => {
                // 'dose 1' being populated by newly entry of 'enrollment'
                const newEnrollmentHeight = '1112';

                // get the height from 'enrollment'
                const newInstanceConfig = new NewInstanceConfig({row: 2, col: 1});
                cy.selectTableEntry(newInstanceConfig);

                cy.selectTextByLabel('Height (cm)')
                    .invoke('val', newEnrollmentHeight)
                    .then(() => {
                        cy.saveForm()
                    });

                // get the height from 'dose 1'
                const eventConfig = new EventConfig({col:2, row: 2});
                cy.selectTableEntry(eventConfig);

                let doseHeightChain = () => {
                    return cy.selectTextByLabel('Height (cm)')
                        .invoke('val')
                        .then((val) => {
                            return val;
                        });
                }
                doseHeightChain().then(height => {
                    expect(newEnrollmentHeight).to.equal(height)
                })
            })

            it('asserts that the the first instance of a repeat form is auto-populated from the previous saved event/form', () => {
                // 'visit 1' populated by last entry of 'dose 1'

                // create entry for dose 1
                let eventConfig = new EventConfig({col: 2, row: 2});
                cy.selectTableEntry(eventConfig)

                let doseHeight;
                let doseHeightChain = () => {
                    return cy.selectTextByLabel('Height (cm)')
                        .invoke('val')
                        .then((val) => {
                            return val
                        })
                }

                doseHeightChain().then(height => {
                    doseHeight = height;
                    cy.saveForm()
                })

                // check value is in first instance of visit 1
                let eventConfig2 = new EventConfig({col: 3, row: 2});
                cy.selectTableEntry(eventConfig2);

                cy.selectTextByLabel('Height (cm)')
                    .invoke('val')
                    .then((val) => {
                        expect(doseHeight).to.equal(val)
                    })


            })

            it('asserts that the the nth instance of a repeat event is auto-populated from the immediate previous instance', () => {
                // for new event
                let eventConfig = new NewEventConfig({col: 2, row: 2})
                cy.selectTableEntry(eventConfig)

                // 'dose 1' instance 2 populated by 'dose 1' instance 1
                // 'dose 1' instance 3 populated by 'dose 1' instance 2
            })

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
        //         cy.visitVersion({ page: Page.RecordStatusDashboard, params: `pid=${pid}` })
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
