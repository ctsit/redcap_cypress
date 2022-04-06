describe('Finish REDCap installation', () => {
  const redcapVersion = Cypress.env('redcap_version');

  it('Install from versioned zip ', () => {
    cy.visit(Cypress.config().baseUrl);
    cy.get('div.form-check label.form-check-label').contains("Use a local copy").click();
    cy.uploadFile(`redcap${redcapVersion}.zip`, "zip", 'input[name=installer-upload]');
    cy.get('div.form-check label.form-check-label').contains("Prepopulate").click();
    cy.get('input.supplement-option.form-control').type("admin@ufl.edu");
    cy.get("button[type='submit']").click();
  })

  it('Install completed', () => {
    const interceptUrl = `${Cypress.config().baseUrl}/*`;
    const loginUrl = `${Cypress.config().baseUrl}/index.php`;

    cy.intercept('GET', loginUrl).as('loginPage');
    cy.visit(loginUrl);
    cy.wait('@loginPage', {requestTimeout: 300000}).then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  });
})
