// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'


before(() => {
    // Create the initial database structure
    const initializingREDCap = Cypress.env('init_redcap');
    if (!initializingREDCap) {
      cy.baseDbSeed()
    }
})

beforeEach(() => {  
    cy.maintainSession()  
})

Cypress.on("uncaught:exception", (err, runnable) => {
  console.debug(">> uncaught:exception disabled in cypress/support/index.js");
  return false;  // prevents Cypress from failing the test
});

