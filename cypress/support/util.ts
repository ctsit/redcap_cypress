import { Callbacks } from "cypress/types/jquery";

const baseUrl = () => {
    return 'BASE_URL/' + Cypress.config('baseUrl').replace(/\//g, "\\/");
}

const camelToSnakeCase = (str) => {
    return str.toLowerCase().replaceAll(/\s/g, letter => '_');
}

export {
    baseUrl, camelToSnakeCase
}

