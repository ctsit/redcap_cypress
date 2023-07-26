describe('Finish REDCap installation', () => {
  const redcapVersion = Cypress.env('redcap_version');

  before(() => {
    cy.visit(Cypress.config().baseUrl);
    cy.get('div.form-check label.form-check-label').contains("Use a local copy").click();
    cy.uploadFile(`redcap-${redcapVersion}.zip`, "zip", 'input[name=installer-upload]');
    cy.get('div.form-check label.form-check-label').contains("Prepopulate").click();
    cy.get('input.supplement-option.form-control').type("admin@ufl.edu");
    cy.get('button[type="submit"]').click();
    cy.get('.modal-content div.loader-txt p').contains('Building your REDCap Server');
  })

  it('Install completed', {
    "retries": {
      // Configure retry attempts for `cypress run`
      // Default is 0
      "runMode": 2,
      // Configure retry attempts for `cypress open`
      // Default is 0
      "openMode": 2
    }
  }, () => {
    cy.wait(60000);
    cy.reload();
    cy.get('.input-group-text span:nth(0)').contains('Username');
  });
})
