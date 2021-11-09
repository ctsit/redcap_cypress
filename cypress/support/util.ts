const baseUrl = () => {
    return 'BASE_URL/' + Cypress.config('baseUrl').replace(/\//g, "\\/");
}

const camelToSnakeCase = (str) => {
    return str.toLowerCase().replaceAll(/\s/g, letter => '_');
}

const createNewEvent = (col) => {
    cy.get(`#event_grid_table > thead th.evGridHdr:nth-child(${col + 1}) > div.divBtnAddRptEv > button`).click()
}

const getTableEntry = (col, row) => {
    return cy.get(`#event_grid_table tbody > tr:nth-child(${row}) > td:nth-child(${col + 1})`)
}

enum InstanceType {
    First,
    Last,
    Nth
}
interface Configurable {
    col: number
    row: number

    selectTargetCell(): void
}

class EventConfig implements Configurable {
    col: number
    row: number

    constructor({ col, row }: { col: number, row: number }) {
        this.col = col;
        this.row = row;
    }

    selectTargetCell() {
        const tableEntry = getTableEntry(this.col, this.row);
        tableEntry.children('a').click();
    }
}

class InstanceConfig implements Configurable {
    row: number
    col: number
    instance: number
    instanceType: InstanceType

    constructor({ col, row, instanceType, instance }: { col: number, row: number, instanceType: InstanceType, instance?: number }) {
        this.col = col;
        this.instance = instance;
        this.row = row;
        this.instanceType = instanceType;
    }

    selectTargetCell() {
        const tableEntry = getTableEntry(this.col, this.row);
        tableEntry.children('a').click();
        switch (this.instanceType) {
            case InstanceType.Nth:
                cy.get(`#instancesTablePopupSub td:contains(${this.instance})+ td > a`).click()
                break;
            case InstanceType.First:
                // The popup only shows if there is more than one instance. 
                // If there is more than one instance, we select the instance via the popup.
                // Otherwise we do not need to select via the popup.
                cy.get('body')
                    .then(($body) => {
                        if ($body.find('#instancesTablePopupSub tr:nth-child(2) td > a').length) {
                            cy.get('#instancesTablePopupSub tr:nth-child(2) td > a').click();
                        }
                    })
                break;
            case InstanceType.Last:
                cy.get('#instancesTablePopupSub tr:nth-last-child(2) td > a').click();
                break;
            default:
                break;
        }

    }
}

class NewEventConfig implements Configurable {
    col: number
    row: number

    constructor({ col, row }: { col: number, row: number }) {
        this.col = col;
        this.row = row;
    }

    selectTargetCell() {
        createNewEvent(this.col)
        const tableEntry = getTableEntry(this.col + 1, this.row)
        tableEntry.children('a').click()
    }
}

class NewInstanceConfig implements Configurable {
    col: number
    row: number

    constructor({ col, row }: { col: number, row: number }) {
        this.col = col;
        this.row = row;
    }

    selectTargetCell() {
        const tableEntry = getTableEntry(this.col, this.row)
        tableEntry.children('button').click()
    }
}


export {
    baseUrl,
    camelToSnakeCase,
    Configurable,
    EventConfig,
    InstanceConfig,
    InstanceType,
    NewEventConfig,
    NewInstanceConfig
}


