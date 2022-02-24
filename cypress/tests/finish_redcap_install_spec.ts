describe('Finish REDCap installation', () => {
    const redcapVersion = Cypress.env('redcap_version');

    it('Install from versioned zip ', () => {
        cy.visit(Cypress.config().baseUrl);
        cy.get('div.form-check label.form-check-label').contains("Use a local copy").click();
        cy.uploadFile(`redcap${redcapVersion}.zip`, "zip", 'input[name=installer-upload]');
        cy.get('div.form-check label.form-check-label').contains("Prepopulate").click();
        cy.get('input.supplement-option.form-control').type("admin@ufl.edu");
          cy.get("button[type='submit']").click();
        cy.get("h5").contains("Initial setup complete!");
    })
})
