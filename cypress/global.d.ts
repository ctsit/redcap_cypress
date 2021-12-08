import { Configurable } from "./support/util";
declare global {
    namespace Cypress {
        interface Chainable {
            addApiUserToProject(user: string, pid: number): Chainable
            baseDbSeed(): Chainable
            createCdiscProject(projectName: string, projectType: string, projectFilePath: string, pid: number): Chainable
            configureModule(module: string, options?: object): Chainable
            disableGlobalModule(module: string): Chainable
            enableModule(module: string, projectLevel: boolean): Chainable
            deleteForm(): Chainable
            deleteProject(pid: number): Chainable
            getEnabledModuleTableEntry(module: string): Chainable<Element>
            getDisabledModuleTableEntry(module: string): Chainable<Element>
            getFieldValueByLabel(name: string, fieldType: string, elementClass?: string, additionalIdentifier?: string): Chainable<Element>
            findOnlineDesignerField(fieldName: string): Chainable<Element>
            leaveForm(): Chainable
            login(username: string, password: string): Chainable
            logout(): Chainable
            maintainSession(): Chainable
            mysqlDb(value: string, pid: string, options?: boolean): Chainable
            mysqlQuery(query: string): Chainable
            saveForm(): Chainable
            saveField(): Chainable
            searchAndEnableGlobalModule(module: string): Chainable
            searchAndEnableProjectModule(module: string): Chainable
            searchForModule(module: string): Chainable<Element>
            selectCheckboxByLabel(labelName: string): Chainable<Element>
            selectRadioByLabel(labelName: string): Chainable<Element>
            selectRecord(recordID: number): void
            selectTableEntry(config: Configurable): Chainable
            selectTextByLabel(labelName: string): Chainable<Element>
            selectTextAreaByLabel(labelName: string): Chainable<Element>
            selectValueByLabel(labelName: string): Chainable<Element>
            selectFieldChoices(labelName: string): Chainable<Element>
            visitBase(obj?: object): Chainable<void>
            visitVersion(obj: object): Chainable<void>
            uiLogin(userType: string): Chainable
            uploadFile(filePath: string, fileType: string, field: string): Chainable
            window(options?: Partial<Loggable & Timeoutable>): Chainable<Window>
        }
    }
}

