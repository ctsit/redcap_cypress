import { NewInstanceConfig, InstanceType, InstanceConfig, EventConfig, NewEventConfig } from "../../../support/util";

describe('Project setup', () => {

    const heightLabelText = 'Height (cm)';
    const moduleName = 'Auto Populate Fields';
    const Page = Cypress.env('page');
    const Path = Cypress.env('path');
    const pid = 16;
    const ProjectType = Cypress.env('projectType')
    const recordID = 7;


    after(() => {
        cy.visitVersion({ page: Page.ExternalModules });
        cy.disableGlobalModule(moduleName);
        cy.logout();
    })

    before(() => {
        cy.uiLogin("admin");
        cy.visitVersion({ page: Page.ExternalModules });
        cy.searchAndEnableGlobalModule(moduleName);
    })

    it('asserts module is enabled under Control Center > External Modules', () => {
        cy.getEnabledModuleTableEntry(moduleName).should(($t) => {
            expect($t).to.contain(moduleName)
        })
    })

    describe('Import project', () => {
        after(() => {
            cy.deleteProject(pid);
        })

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

        describe('Project with chronological event detection on', () => {
            before(() => {
                cy.configureModule(moduleName, {
                    "chronological_previous_event": true
                });
            })

            beforeEach(() => {
                cy.visitVersion({ page: Page.RecordStatusDashboard, params: `pid=${pid}` })
                cy.selectRecord(recordID)
            })

            // it('asserts project was created from xml', () => {
            //     const fileName = "auto_populate_fields.xml";
            //     cy.createCdiscProject('Auto Populate Fields', ProjectType.Practice, `${Path.cdisc}/${fileName}`, pid)
            // })

            // it('asserts module was enabled for project', () => {
            //     cy.visitVersion({ page: Page.ProjectExternalModules, params: `pid=${pid}` })
            //     cy.searchAndEnableProjectModule(moduleName);
            //     cy.getEnabledModuleTableEntry(moduleName).should(($t) => {
            //         expect($t).to.contain(moduleName)
            //     })
            // })

            it('asserts that the first instance of a repeat event is auto-populated from the previous saved event/form', () => {
                // 'dose 1' being populated by last entry of 'enrollment'

                // get the height from 'enrollment'
                const instanceConfig = new InstanceConfig({ col: 1, row: 2, instanceType: InstanceType.Last });
                cy.selectTableEntry(instanceConfig);

                let enrollmentHeight;
                let enrollmentHeightChain = () => {
                    return cy.selectTextByLabel(heightLabelText)
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
                const eventConfig = new EventConfig({ col: 2, row: 2 });
                cy.selectTableEntry(eventConfig);

                let doseHeightChain = () => {
                    return cy.selectTextByLabel(heightLabelText)
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
                // 'dose 1' being populated by newly created entry of 'enrollment'
                const newEnrollmentHeight = '1112';

                // get the height from 'enrollment'
                const newInstanceConfig = new NewInstanceConfig({ row: 2, col: 1 });
                cy.selectTableEntry(newInstanceConfig);

                cy.selectTextByLabel(heightLabelText)
                    .invoke('val', newEnrollmentHeight)
                    .then(() => {
                        cy.saveForm()
                    });

                // get the height from 'dose 1'
                const eventConfig = new EventConfig({ col: 2, row: 2 });
                cy.selectTableEntry(eventConfig);

                let doseHeightChain = () => {
                    return cy.selectTextByLabel(heightLabelText)
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
                let eventConfig = new EventConfig({ col: 2, row: 2 });
                cy.selectTableEntry(eventConfig)

                let doseHeight;
                let doseHeightChain = () => {
                    return cy.selectTextByLabel(heightLabelText)
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
                let eventConfig2 = new EventConfig({ col: 3, row: 2 });
                cy.selectTableEntry(eventConfig2);

                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(doseHeight).to.equal(val)
                    })
            })

            it('asserts that the the nth instance of a repeat event is auto-populated from the immediate previous instance', () => {
                // get height from instance one
                let instanceOne = new EventConfig({ col: 2, row: 2 });
                let instanceOneHeight;
                cy.selectTableEntry(instanceOne)
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        instanceOneHeight = val;
                        cy.leaveForm()
                    })

                // 'dose 1' instance 2 populated by 'dose 1' instance 1
                const instanceTwoHeight = "2";
                let instanceTwo = new NewEventConfig({ col: 2, row: 2 });
                cy.selectTableEntry(instanceTwo)
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal(instanceOneHeight)
                    })

                // save instance two
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val', instanceTwoHeight)
                    .then(() => {
                        cy.saveForm();
                    });


                // 'dose 1' instance 3 populated by 'dose 1' instance 2
                let instanceThree = new NewEventConfig({ col: 3, row: 2 });
                cy.selectTableEntry(instanceThree);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal(instanceTwoHeight);
                    })
            })

            it('asserts that the the nth instance of a repeat form is auto-populated from the immediate previous instance', () => {
                const enrollmentCol = 1;
                const event4Col = 5;

                // Delete instance 3 and 4
                let enrollmentInstanceThree = new InstanceConfig({ col: enrollmentCol, row: 2, instanceType: InstanceType.Nth, instance: 3 })
                cy.selectTableEntry(enrollmentInstanceThree)
                    .then(() => cy.deleteForm());

                let enrollmentInstanceFour = new InstanceConfig({ col: enrollmentCol, row: 2, instanceType: InstanceType.Nth, instance: 4 })
                cy.selectTableEntry(enrollmentInstanceFour)
                    .then(() => cy.deleteForm());

                // 'enrollment' instance 2 is populated by 'enrollment' instance 1
                let enrollmentInstanceOneHeight;
                let enrollmentInstanceOne = new InstanceConfig({ col: enrollmentCol, row: 2, instanceType: InstanceType.First })
                cy.selectTableEntry(enrollmentInstanceOne)
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val', '1')
                    .then((val) => {
                        enrollmentInstanceOneHeight = '1';
                        cy.leaveForm()
                    })

                let enrollmentInstanceTwo = new NewInstanceConfig({ col: enrollmentCol, row: 2 })
                cy.selectTableEntry(enrollmentInstanceTwo)
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal(enrollmentInstanceOneHeight);
                    })

                // 'enrollment' instance 3 is populated by 'enrollment' instance 2
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val', '2')
                    .then(() => {
                        cy.saveForm();
                    })

                let newInstance = new NewInstanceConfig({ col: enrollmentCol, row: 2 });
                cy.selectTableEntry(newInstance);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal('2');
                        cy.leaveForm()
                    })


                // check 'event 4' is auto-populated from visit Event2 instance 2
                let eventFour = new EventConfig({ col: event4Col, row: 2 });
                cy.selectTableEntry(eventFour);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal('2');
                        cy.leaveForm()
                    })

                let visitThree = new EventConfig({ col: 4, row: 2 });
                cy.selectTableEntry(visitThree);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val', '3')
                    .then(() => cy.saveForm());

                cy.selectTableEntry(eventFour);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal('3');
                    })
            })

            it('asserts that the that new instances for a repeat event/instrument (having 2+ instances) are auto-populated after deleting (Delete data for THIS FORM only) any form except for last', () => {
                // add enrollment instance
                let enrollmentInstanceThree = new NewInstanceConfig({ col: 1, row: 2 });
                cy.selectTableEntry(enrollmentInstanceThree);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val', '3')
                    .then(() => cy.saveForm());

                // delete instance two
                let enrollmentInstanceTwo = new InstanceConfig({ col: 1, row: 2, instanceType: InstanceType.Nth, instance: 2 });
                cy.selectTableEntry(enrollmentInstanceTwo);
                cy.selectTextByLabel(heightLabelText)
                    .then(() => cy.deleteForm());

                // create instance 4 and verify it is being auto-populated by instance 3
                let enrollmentInstanceFour = new NewInstanceConfig({ col: 1, row: 2 });
                cy.selectTableEntry(enrollmentInstanceFour);
                cy.selectTextByLabel(heightLabelText)
                    .invoke('val')
                    .then((val) => {
                        expect(val).to.equal('3');
                        cy.saveForm();
                    });
            })
        })
    })
})
