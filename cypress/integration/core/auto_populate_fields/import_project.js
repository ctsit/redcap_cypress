describe('Import Project', () => {

    const page = Cypress.env('page');
    const path = Cypress.env('path');
    const projectType = Cypress.env('project_type')
    const moduleName = 'Auto Populate Fields';
    const pid = 15;

    before(() => {
        cy.set_user_type('admin')
        cy.ui_login()
        cy.visit_version({ page: page.ExternalModules })
        cy.searchAndEnableModule(moduleName);
    })

    it('Should have enabled module listed', () => {
        cy.getEnabledModuleTableEntry(moduleName).should(($t) => {
            expect($t).to.contain(moduleName)
        })
    })

    it('Should have the ability to create project from xml', () => {
        const fileName = "auto_populate_fields.xml";
        cy.create_cdisc_project('Auto Populate Fields', projectType.Practice, `${path.cdisc}/${fileName}`, pid)
    })
})
