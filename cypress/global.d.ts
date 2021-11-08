declare namespace Cypress {
    interface Chainable {
        window(options?: Partial<Loggable & Timeoutable>): Chainable<Window>
        login(username: string, password: string): Chainable
        maintain_login(): Chainable
        set_user_info(users: any): Chainable
        set_user_type(users: any): Chainable
        base_db_seed(): Chainable
        create_cdisc_project(projectName: string, projectType: string, projectFilePath: string, pid: number): void
        enableModule(module: string, projectLevel: boolean): Chainable<void>
        searchForModule(module: string): Chainable<void>
        searchAndEnableProjectModule(module: string): void
        configureModule(module: string): void
        selectTableEntry(options: object): void
        select_text_by_label(labelName: string, overrideValue?: string): Chainable<Element>
        selectRecord(recordID: number): void
        leaveForm(): void
        saveForm(): void
        getDisabledModuleTableEntry(module: string): Chainable<void>
        getEnabledModuleTableEntry(module: string): Chainable<void>
        searchAndEnableGlobalModule(module: string): void
        set_field_value_by_label(name: string, value: string, fieldType: string, elementClass?: string, additionalIdentifier?: string): Chainable<Element>
        save_field(): Chainable<void>
        find_online_designer_field(fieldName: string): Chainable<void>
        visit_base(obj?: object): Chainable<void>
        visit_version(obj: object): Chainable<void>
        mysql_db(value: string, pid: string, options?: boolean): Chainable<void>
        mysql_query(query: string): Chainable<void>
        add_api_user_to_project(user: string, pid: number): Chainable<void>
        upload_file(filePath: string, fileType: string, field: string): Chainable<void>
        ui_login(username: string, password: string): Chainable

    }
}
