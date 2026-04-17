/**
 * ============================================================================
 * ZerxLab Website - Directus Schema 类型
 * ----------------------------------------------------------------------------
 * 文件结构:
 *   1. 手写区(此区块):项目用到的通用类型别名
 *      - DirectusStatus / LanguageCode / ISODateTime / ISODate
 *      - 以及 fallback-data 层会共用的 Bilingual 相关类型(若有)
 *   2. 自动生成区(由 `bun run typegen` 维护):
 *      - 从 Directus OAS 派生的 `components["schemas"]`
 *      - 业务 collection 的友好别名(`Posts` / `Authors` 等)
 *      - `Schema` interface,供 `@directus/sdk` 泛型参数使用
 *
 * 请勿手工修改"自动生成区",所有 schema 变更应先在 Directus UI 里完成,
 * 再运行 `bun run typegen` 同步类型。
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 通用类型(手写,不受 typegen 覆盖)
 * ---------------------------------------------------------------------------- */

/** 发布状态(draft/published/archived workflow) */
export type DirectusStatus = "draft" | "published" | "archived";

/** 支持的语言代码(与 src/i18n/ui.ts 保持一致) */
export type LanguageCode = "zh-CN" | "en-US";

/** ISO 8601 日期时间字符串 */
export type ISODateTime = string;

/** ISO 8601 日期字符串 */
export type ISODate = string;


/* <<< AUTO-GENERATED-BY-TYPEGEN:START >>> */
/* ↓↓↓ 由 `bun run typegen` 自动生成,请勿手改 ↓↓↓ */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface paths {
    "/assets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get an Asset
         * @description Image typed files can be dynamically resized and transformed to fit any need.
         */
        get: operations["getAsset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retrieve a Temporary Access Token
         * @description Retrieve a Temporary Access Token
         */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh Token
         * @description Refresh a Temporary Access Token.
         */
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log Out
         * @description Log Out
         */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request a Password Reset
         * @description Request a reset password email to be send.
         */
        post: operations["passwordRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reset a Password
         * @description The request a password reset endpoint sends an email with a link to the admin app which in turn uses this endpoint to allow the user to reset their password.
         */
        post: operations["passwordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List OAuth Providers
         * @description List configured OAuth providers.
         */
        get: operations["oauth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/{provider}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Authenticated using an OAuth provider
         * @description Start OAuth flow using the specified provider
         */
        get: operations["oauthProvider"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/schema/snapshot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve Schema Snapshot
         * @description Retrieve the current schema. This endpoint is only available to admin users.
         */
        get: operations["schemaSnapshot"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/schema/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Apply Schema Difference
         * @description Update the instance's schema by passing the diff previously retrieved via `/schema/diff` endpoint in the JSON request body or a JSON/YAML file. This endpoint is only available to admin users.
         */
        post: operations["schemaApply"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/schema/diff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retrieve Schema Difference
         * @description Compare the current instance's schema against the schema snapshot in JSON request body or a JSON/YAML file and retrieve the difference. This endpoint is only available to admin users.
         */
        post: operations["schemaDiff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/server/info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * System Info
         * @description Perform a system status check and return the options.
         */
        get: operations["serverInfo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/server/ping": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ping
         * @description Ping, pong. Ping.. pong.
         */
        get: operations["ping"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/hash/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Hash a string
         * @description Generate a hash for a given string.
         */
        post: operations["hash-generate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/hash/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Hash a string
         * @description Generate a hash for a given string.
         */
        post: operations["hash-verify"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/sort/{collection}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sort Items
         * @description Re-sort items in collection based on start and to value of item
         */
        post: operations["sort"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/import/{collection}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Import Items
         * @description Import multiple records from a JSON or CSV file into a collection.
         */
        post: operations["import"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/export/{collection}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Export Items
         * @description Export a larger data set to a file in the File Library
         */
        post: operations["export"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/cache/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Clear Cache
         * @description Resets both the data and schema cache of Directus.
         */
        post: operations["clear-cache"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/utils/random/string": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a Random String
         * @description Returns a random string of given length.
         */
        get: operations["random"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Roles
         * @description List the roles.
         */
        get: operations["getRoles"];
        put?: never;
        /**
         * Create a Role
         * @description Create a new role.
         */
        post: operations["createRole"];
        /**
         * Delete Multiple Roles
         * @description Delete multiple existing roles.
         */
        delete: operations["deleteRoles"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Roles
         * @description Update multiple roles at the same time.
         */
        patch: operations["updateRoles"];
        trace?: never;
    };
    "/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Role
         * @description Retrieve a single role by unique identifier.
         */
        get: operations["getRole"];
        put?: never;
        post?: never;
        /**
         * Delete a Role
         * @description Delete an existing role
         */
        delete: operations["deleteRole"];
        options?: never;
        head?: never;
        /**
         * Update a Role
         * @description Update an existing role
         */
        patch: operations["updateRole"];
        trace?: never;
    };
    "/collections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Collections
         * @description Returns a list of the collections available in the project.
         */
        get: operations["getCollections"];
        put?: never;
        /**
         * Create a Collection
         * @description Create a new collection in Directus.
         */
        post: operations["createCollection"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/collections/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Collection
         * @description Retrieves the details of a single collection.
         */
        get: operations["getCollection"];
        put?: never;
        post?: never;
        /**
         * Delete a Collection
         * @description Delete an existing collection. Warning: This will delete the whole collection, including the items within. Proceed with caution.
         */
        delete: operations["deleteCollection"];
        options?: never;
        head?: never;
        /**
         * Update a Collection
         * @description Update an existing collection.
         */
        patch: operations["updateCollection"];
        trace?: never;
    };
    "/fields": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List All Fields
         * @description Returns a list of the fields available in the project.
         */
        get: operations["getFields"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/fields/{collection}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Fields in Collection
         * @description Returns a list of the fields available in the given collection.
         */
        get: operations["getCollectionFields"];
        put?: never;
        /**
         * Create Field in Collection
         * @description Create a new field in a given collection.
         */
        post: operations["createField"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/fields/{collection}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Field
         * @description Retrieves the details of a single field in a given collection.
         */
        get: operations["getCollectionField"];
        put?: never;
        post?: never;
        /**
         * Delete a Field
         * @description Delete an existing field.
         */
        delete: operations["deleteField"];
        options?: never;
        head?: never;
        /**
         * Update a Field
         * @description Update an existing field.
         */
        patch: operations["updateField"];
        trace?: never;
    };
    "/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Files
         * @description List the files.
         */
        get: operations["getFiles"];
        put?: never;
        /**
         * Create a File
         * @description Create a new file
         */
        post: operations["createFile"];
        /**
         * Delete Multiple Files
         * @description Delete multiple existing files.
         */
        delete: operations["deleteFiles"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Files
         * @description Update multiple files at the same time.
         */
        patch: operations["updateFiles"];
        trace?: never;
    };
    "/files/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Files
         * @description Retrieve a single file by unique identifier.
         */
        get: operations["getFile"];
        put?: never;
        post?: never;
        /**
         * Delete a File
         * @description Delete an existing file.
         */
        delete: operations["deleteFile"];
        options?: never;
        head?: never;
        /**
         * Update a File
         * @description Update an existing file, and/or replace it's file contents.
         */
        patch: operations["updateFile"];
        trace?: never;
    };
    "/folders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Folders
         * @description List the folders.
         */
        get: operations["getFolders"];
        put?: never;
        /**
         * Create a Folder
         * @description Create a new folder.
         */
        post: operations["createFolder"];
        /**
         * Delete Multiple Folders
         * @description Delete multiple existing folders.
         */
        delete: operations["deleteFolders"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Folders
         * @description Update multiple folders at the same time.
         */
        patch: operations["updateFolders"];
        trace?: never;
    };
    "/folders/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Folder
         * @description Retrieve a single folder by unique identifier.
         */
        get: operations["getFolder"];
        put?: never;
        post?: never;
        /**
         * Delete a Folder
         * @description Delete an existing folder
         */
        delete: operations["deleteFolder"];
        options?: never;
        head?: never;
        /**
         * Update a Folder
         * @description Update an existing folder
         */
        patch: operations["updateFolder"];
        trace?: never;
    };
    "/activity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Activity Actions
         * @description Returns a list of activity actions.
         */
        get: operations["getActivities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/activity/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Activity Action
         * @description Retrieves the details of an existing activity action. Provide the primary key of the activity action and Directus will return the corresponding information.
         */
        get: operations["getActivity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Revisions
         * @description List the revisions.
         */
        get: operations["getRevisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/revisions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Revision
         * @description Retrieve a single revision by unique identifier.
         */
        get: operations["getRevision"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Users
         * @description List the users.
         */
        get: operations["getUsers"];
        put?: never;
        /**
         * Create a User
         * @description Create a new user.
         */
        post: operations["createUser"];
        /**
         * Delete Multiple Users
         * @description Delete multiple existing users.
         */
        delete: operations["deleteUsers"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Users
         * @description Update multiple users at the same time.
         */
        patch: operations["updateUsers"];
        trace?: never;
    };
    "/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a User
         * @description Retrieve a single user by unique identifier.
         */
        get: operations["getUser"];
        put?: never;
        post?: never;
        /**
         * Delete a User
         * @description Delete an existing user
         */
        delete: operations["deleteUser"];
        options?: never;
        head?: never;
        /**
         * Update a User
         * @description Update an existing user
         */
        patch: operations["updateUser"];
        trace?: never;
    };
    "/users/invite": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Invite User(s)
         * @description Invites one or more users to this project. It creates a user with an invited status, and then sends an email to the user with instructions on how to activate their account.
         */
        post: operations["invite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/invite/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Accept User Invite
         * @description Accepts and enables an invited user using a JWT invitation token.
         */
        post: operations["acceptInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve Current User
         * @description Retrieve the currently authenticated user.
         */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Current User
         * @description Update the currently authenticated user.
         */
        patch: operations["updateMe"];
        trace?: never;
    };
    "/users/me/track/page": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Last Page
         * @description Updates the last used page field of the currently authenticated user. This is used internally to be able to open the Directus admin app from the last page you used.
         */
        patch: operations["updateLastUsedPageMe"];
        trace?: never;
    };
    "/users/me/tfa/enable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Enable 2FA
         * @description Enables two-factor authentication for the currently authenticated user.
         */
        post: operations["meTfaEnable"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/me/tfa/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Disable 2FA
         * @description Disables two-factor authentication for the currently authenticated user.
         */
        post: operations["meTfaDisable"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/relations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Relations
         * @description List the relations.
         */
        get: operations["getRelations"];
        put?: never;
        /**
         * Create a Relation
         * @description Create a new relation.
         */
        post: operations["createRelation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/relations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Relation
         * @description Retrieve a single relation by unique identifier.
         */
        get: operations["getRelation"];
        put?: never;
        post?: never;
        /**
         * Delete a Relation
         * @description Delete an existing relation.
         */
        delete: operations["deleteRelation"];
        options?: never;
        head?: never;
        /**
         * Update a Relation
         * @description Update an existing relation
         */
        patch: operations["updateRelation"];
        trace?: never;
    };
    "/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Permissions
         * @description List all permissions.
         */
        get: operations["getPermissions"];
        put?: never;
        /**
         * Create a Permission
         * @description Create a new permission.
         */
        post: operations["createPermission"];
        /**
         * Delete Multiple Permissions
         * @description Delete multiple existing permissions.
         */
        delete: operations["deletePermissions"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Permissions
         * @description Update multiple permissions at the same time.
         */
        patch: operations["updatePermissions"];
        trace?: never;
    };
    "/permissions/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List My Permissions
         * @description List the permissions that apply to the current user.
         */
        get: operations["getMyPermissions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/permissions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Permission
         * @description Retrieve a single permissions object by unique identifier.
         */
        get: operations["getPermission"];
        put?: never;
        post?: never;
        /**
         * Delete a Permission
         * @description Delete an existing permission
         */
        delete: operations["deletePermission"];
        options?: never;
        head?: never;
        /**
         * Update a Permission
         * @description Update an existing permission
         */
        patch: operations["updatePermission"];
        trace?: never;
    };
    "/presets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Presets
         * @description List the presets.
         */
        get: operations["getPresets"];
        put?: never;
        /**
         * Create a Preset
         * @description Create a new preset.
         */
        post: operations["createPreset"];
        /**
         * Delete Multiple Presets
         * @description Delete multiple existing presets.
         */
        delete: operations["deletePresets"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Presets
         * @description Update multiple presets at the same time.
         */
        patch: operations["updatePresets"];
        trace?: never;
    };
    "/presets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Preset
         * @description Retrieve a single preset by unique identifier.
         */
        get: operations["getPreset"];
        put?: never;
        post?: never;
        /**
         * Delete a Preset
         * @description Delete an existing preset.
         */
        delete: operations["deletePreset"];
        options?: never;
        head?: never;
        /**
         * Update a Preset
         * @description Update an existing preset.
         */
        patch: operations["updatePreset"];
        trace?: never;
    };
    "/webhooks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Webhooks
         * @description Get all webhooks.
         */
        get: operations["getWebhooks"];
        put?: never;
        /**
         * Create a Webhook
         * @description Create a new webhook.
         */
        post: operations["createWebhook"];
        /**
         * Delete Multiple Webhooks
         * @description Delete multiple existing webhooks.
         */
        delete: operations["deleteWebhooks"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Webhooks
         * @description Update multiple webhooks at the same time.
         */
        patch: operations["updateWebhooks"];
        trace?: never;
    };
    "/webhooks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Webhook
         * @description Retrieve a single webhook by unique identifier.
         */
        get: operations["getWebhook"];
        put?: never;
        post?: never;
        /**
         * Delete a Webhook
         * @description Delete an existing webhook
         */
        delete: operations["deleteWebhook"];
        options?: never;
        head?: never;
        /**
         * Update a Webhook
         * @description Update an existing webhook
         */
        patch: operations["updateWebhook"];
        trace?: never;
    };
    "/flows": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Flows
         * @description Get all flows.
         */
        get: operations["getFlows"];
        put?: never;
        /**
         * Create a Flow
         * @description Create a new flow.
         */
        post: operations["createFlow"];
        /**
         * Delete Multiple Flows
         * @description Delete multiple existing flows.
         */
        delete: operations["deleteFlows"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Flows
         * @description Update multiple flows at the same time.
         */
        patch: operations["updateFlows"];
        trace?: never;
    };
    "/flows/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Flow
         * @description Retrieve a single flow by unique identifier.
         */
        get: operations["getFlow"];
        put?: never;
        post?: never;
        /**
         * Delete a Flow
         * @description Delete an existing flow
         */
        delete: operations["deleteFlow"];
        options?: never;
        head?: never;
        /**
         * Update a Flow
         * @description Update an existing flow
         */
        patch: operations["updateFlow"];
        trace?: never;
    };
    "/operations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Operations
         * @description Get all operations.
         */
        get: operations["getOperations"];
        put?: never;
        /**
         * Create an Operation
         * @description Create a new operation.
         */
        post: operations["createOperation"];
        /**
         * Delete Multiple Operations
         * @description Delete multiple existing operations.
         */
        delete: operations["deleteOperations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Operations
         * @description Update multiple operations at the same time.
         */
        patch: operations["updateOperations"];
        trace?: never;
    };
    "/operations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Operation
         * @description Retrieve a single operation by unique identifier.
         */
        get: operations["getOperation"];
        put?: never;
        post?: never;
        /**
         * Delete an Operation
         * @description Delete an existing operation
         */
        delete: operations["deleteOperation"];
        options?: never;
        head?: never;
        /**
         * Update an Operation
         * @description Update an existing operation
         */
        patch: operations["updateOperation"];
        trace?: never;
    };
    "/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Comments
         * @description List the comments.
         */
        get: operations["getComments"];
        put?: never;
        /**
         * Create a Comment
         * @description Create a new comment.
         */
        post: operations["createComment"];
        /**
         * Delete Multiple Comments
         * @description Delete multiple existing comments.
         */
        delete: operations["deleteComments"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Comments
         * @description Update multiple comments at the same time.
         */
        patch: operations["updateComments"];
        trace?: never;
    };
    "/comments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Comment
         * @description Retrieve a single comment by unique identifier.
         */
        get: operations["getComment"];
        put?: never;
        post?: never;
        /**
         * Delete a Comment
         * @description Delete an existing comment.
         */
        delete: operations["deleteComment"];
        options?: never;
        head?: never;
        /**
         * Update a Comment
         * @description Update an existing comment.
         */
        patch: operations["updateComment"];
        trace?: never;
    };
    "/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Content Versions
         * @description Get all Content Versions.
         */
        get: operations["getContentVersions"];
        put?: never;
        /**
         * Create Multiple Content Versions
         * @description Create multiple new Content Versions.
         */
        post: operations["createContentVersion"];
        /**
         * Delete Multiple Content Versions
         * @description Delete multiple existing Content Versions.
         */
        delete: operations["deleteContentVersions"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Content Versions
         * @description Update multiple Content Versions at the same time.
         */
        patch: operations["updateContentVersions"];
        trace?: never;
    };
    "/versions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve a Content Version
         * @description Retrieve a single Content Version by unique identifier.
         */
        get: operations["getContentVersion"];
        put?: never;
        post?: never;
        /**
         * Delete a Content Version
         * @description Delete an existing Content Version.
         */
        delete: operations["deleteContentVersion"];
        options?: never;
        head?: never;
        /**
         * Update a Content Version
         * @description Update an existing Content Version.
         */
        patch: operations["updateContentVersion"];
        trace?: never;
    };
    "/versions/{id}/save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Save to a Content Version
         * @description Save item changes to an existing Content Version.
         */
        post: operations["saveContentVersion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/versions/{id}/compare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Compare a Content Version
         * @description Compare an existing Content Version with the main version of the item.
         */
        get: operations["compareContentVersion"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/versions/{id}/promote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Promote a Content Version
         * @description Pass the current hash of the main version of the item (obtained from the `compare` endpoint) along with an optional array of field names of which the values are to be promoted (by default, all fields are selected).
         */
        post: operations["promoteContentVersion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/extensions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Extensions
         * @description List the installed extensions and their configuration in the project.
         */
        get: operations["listExtensions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/extensions/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update an Extension
         * @description Update an existing extension.
         */
        patch: operations["updateExtensions"];
        trace?: never;
    };
    "/extensions/{bundle}/{name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update an Extension
         * @description Update an existing extension.
         */
        patch: operations["updateExtensionBundle"];
        trace?: never;
    };
    "/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve Settings
         * @description List the settings.
         */
        get: operations["getSettings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Settings
         * @description Update the settings
         */
        patch: operations["updateSetting"];
        trace?: never;
    };
    "/items/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the categories items.
         */
        get: operations["readItemsCategories"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new categories item.
         */
        post: operations["createItemsCategories"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing categories items.
         */
        delete: operations["deleteItemsCategories"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple categories items at the same time.
         */
        patch: operations["updateItemsCategories"];
        trace?: never;
    };
    "/items/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single categories item by unique identifier.
         */
        get: operations["readSingleItemsCategories"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing categories item.
         */
        delete: operations["deleteSingleItemsCategories"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing categories item.
         */
        patch: operations["updateSingleItemsCategories"];
        trace?: never;
    };
    "/items/site_settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the site_settings items.
         */
        get: operations["readItemsSiteSettings"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new site_settings item.
         */
        post: operations["createItemsSiteSettings"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing site_settings items.
         */
        delete: operations["deleteItemsSiteSettings"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple site_settings items at the same time.
         */
        patch: operations["updateItemsSiteSettings"];
        trace?: never;
    };
    "/items/site_settings/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single site_settings item by unique identifier.
         */
        get: operations["readSingleItemsSiteSettings"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing site_settings item.
         */
        delete: operations["deleteSingleItemsSiteSettings"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing site_settings item.
         */
        patch: operations["updateSingleItemsSiteSettings"];
        trace?: never;
    };
    "/items/authors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the authors items.
         */
        get: operations["readItemsAuthors"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new authors item.
         */
        post: operations["createItemsAuthors"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing authors items.
         */
        delete: operations["deleteItemsAuthors"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple authors items at the same time.
         */
        patch: operations["updateItemsAuthors"];
        trace?: never;
    };
    "/items/authors/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single authors item by unique identifier.
         */
        get: operations["readSingleItemsAuthors"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing authors item.
         */
        delete: operations["deleteSingleItemsAuthors"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing authors item.
         */
        patch: operations["updateSingleItemsAuthors"];
        trace?: never;
    };
    "/items/categories_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the categories_translations items.
         */
        get: operations["readItemsCategoriesTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new categories_translations item.
         */
        post: operations["createItemsCategoriesTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing categories_translations items.
         */
        delete: operations["deleteItemsCategoriesTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple categories_translations items at the same time.
         */
        patch: operations["updateItemsCategoriesTranslations"];
        trace?: never;
    };
    "/items/categories_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single categories_translations item by unique identifier.
         */
        get: operations["readSingleItemsCategoriesTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing categories_translations item.
         */
        delete: operations["deleteSingleItemsCategoriesTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing categories_translations item.
         */
        patch: operations["updateSingleItemsCategoriesTranslations"];
        trace?: never;
    };
    "/items/languages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the languages items.
         */
        get: operations["readItemsLanguages"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new languages item.
         */
        post: operations["createItemsLanguages"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing languages items.
         */
        delete: operations["deleteItemsLanguages"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple languages items at the same time.
         */
        patch: operations["updateItemsLanguages"];
        trace?: never;
    };
    "/items/languages/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single languages item by unique identifier.
         */
        get: operations["readSingleItemsLanguages"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing languages item.
         */
        delete: operations["deleteSingleItemsLanguages"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing languages item.
         */
        patch: operations["updateSingleItemsLanguages"];
        trace?: never;
    };
    "/items/site_settings_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the site_settings_translations items.
         */
        get: operations["readItemsSiteSettingsTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new site_settings_translations item.
         */
        post: operations["createItemsSiteSettingsTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing site_settings_translations items.
         */
        delete: operations["deleteItemsSiteSettingsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple site_settings_translations items at the same time.
         */
        patch: operations["updateItemsSiteSettingsTranslations"];
        trace?: never;
    };
    "/items/site_settings_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single site_settings_translations item by unique identifier.
         */
        get: operations["readSingleItemsSiteSettingsTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing site_settings_translations item.
         */
        delete: operations["deleteSingleItemsSiteSettingsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing site_settings_translations item.
         */
        patch: operations["updateSingleItemsSiteSettingsTranslations"];
        trace?: never;
    };
    "/items/authors_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the authors_translations items.
         */
        get: operations["readItemsAuthorsTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new authors_translations item.
         */
        post: operations["createItemsAuthorsTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing authors_translations items.
         */
        delete: operations["deleteItemsAuthorsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple authors_translations items at the same time.
         */
        patch: operations["updateItemsAuthorsTranslations"];
        trace?: never;
    };
    "/items/authors_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single authors_translations item by unique identifier.
         */
        get: operations["readSingleItemsAuthorsTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing authors_translations item.
         */
        delete: operations["deleteSingleItemsAuthorsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing authors_translations item.
         */
        patch: operations["updateSingleItemsAuthorsTranslations"];
        trace?: never;
    };
    "/items/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the tags items.
         */
        get: operations["readItemsTags"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new tags item.
         */
        post: operations["createItemsTags"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing tags items.
         */
        delete: operations["deleteItemsTags"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple tags items at the same time.
         */
        patch: operations["updateItemsTags"];
        trace?: never;
    };
    "/items/tags/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single tags item by unique identifier.
         */
        get: operations["readSingleItemsTags"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing tags item.
         */
        delete: operations["deleteSingleItemsTags"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing tags item.
         */
        patch: operations["updateSingleItemsTags"];
        trace?: never;
    };
    "/items/tags_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the tags_translations items.
         */
        get: operations["readItemsTagsTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new tags_translations item.
         */
        post: operations["createItemsTagsTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing tags_translations items.
         */
        delete: operations["deleteItemsTagsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple tags_translations items at the same time.
         */
        patch: operations["updateItemsTagsTranslations"];
        trace?: never;
    };
    "/items/tags_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single tags_translations item by unique identifier.
         */
        get: operations["readSingleItemsTagsTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing tags_translations item.
         */
        delete: operations["deleteSingleItemsTagsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing tags_translations item.
         */
        patch: operations["updateSingleItemsTagsTranslations"];
        trace?: never;
    };
    "/items/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the projects items.
         */
        get: operations["readItemsProjects"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new projects item.
         */
        post: operations["createItemsProjects"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing projects items.
         */
        delete: operations["deleteItemsProjects"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple projects items at the same time.
         */
        patch: operations["updateItemsProjects"];
        trace?: never;
    };
    "/items/projects/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single projects item by unique identifier.
         */
        get: operations["readSingleItemsProjects"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing projects item.
         */
        delete: operations["deleteSingleItemsProjects"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing projects item.
         */
        patch: operations["updateSingleItemsProjects"];
        trace?: never;
    };
    "/items/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the posts items.
         */
        get: operations["readItemsPosts"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new posts item.
         */
        post: operations["createItemsPosts"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing posts items.
         */
        delete: operations["deleteItemsPosts"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple posts items at the same time.
         */
        patch: operations["updateItemsPosts"];
        trace?: never;
    };
    "/items/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single posts item by unique identifier.
         */
        get: operations["readSingleItemsPosts"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing posts item.
         */
        delete: operations["deleteSingleItemsPosts"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing posts item.
         */
        patch: operations["updateSingleItemsPosts"];
        trace?: never;
    };
    "/items/projects_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the projects_translations items.
         */
        get: operations["readItemsProjectsTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new projects_translations item.
         */
        post: operations["createItemsProjectsTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing projects_translations items.
         */
        delete: operations["deleteItemsProjectsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple projects_translations items at the same time.
         */
        patch: operations["updateItemsProjectsTranslations"];
        trace?: never;
    };
    "/items/projects_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single projects_translations item by unique identifier.
         */
        get: operations["readSingleItemsProjectsTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing projects_translations item.
         */
        delete: operations["deleteSingleItemsProjectsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing projects_translations item.
         */
        patch: operations["updateSingleItemsProjectsTranslations"];
        trace?: never;
    };
    "/items/posts_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the posts_translations items.
         */
        get: operations["readItemsPostsTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new posts_translations item.
         */
        post: operations["createItemsPostsTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing posts_translations items.
         */
        delete: operations["deleteItemsPostsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple posts_translations items at the same time.
         */
        patch: operations["updateItemsPostsTranslations"];
        trace?: never;
    };
    "/items/posts_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single posts_translations item by unique identifier.
         */
        get: operations["readSingleItemsPostsTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing posts_translations item.
         */
        delete: operations["deleteSingleItemsPostsTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing posts_translations item.
         */
        patch: operations["updateSingleItemsPostsTranslations"];
        trace?: never;
    };
    "/items/aur_packages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the aur_packages items.
         */
        get: operations["readItemsAurPackages"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new aur_packages item.
         */
        post: operations["createItemsAurPackages"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing aur_packages items.
         */
        delete: operations["deleteItemsAurPackages"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple aur_packages items at the same time.
         */
        patch: operations["updateItemsAurPackages"];
        trace?: never;
    };
    "/items/aur_packages/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single aur_packages item by unique identifier.
         */
        get: operations["readSingleItemsAurPackages"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing aur_packages item.
         */
        delete: operations["deleteSingleItemsAurPackages"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing aur_packages item.
         */
        patch: operations["updateSingleItemsAurPackages"];
        trace?: never;
    };
    "/items/posts_tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the posts_tags items.
         */
        get: operations["readItemsPostsTags"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new posts_tags item.
         */
        post: operations["createItemsPostsTags"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing posts_tags items.
         */
        delete: operations["deleteItemsPostsTags"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple posts_tags items at the same time.
         */
        patch: operations["updateItemsPostsTags"];
        trace?: never;
    };
    "/items/posts_tags/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single posts_tags item by unique identifier.
         */
        get: operations["readSingleItemsPostsTags"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing posts_tags item.
         */
        delete: operations["deleteSingleItemsPostsTags"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing posts_tags item.
         */
        patch: operations["updateSingleItemsPostsTags"];
        trace?: never;
    };
    "/items/aur_packages_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the aur_packages_translations items.
         */
        get: operations["readItemsAurPackagesTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new aur_packages_translations item.
         */
        post: operations["createItemsAurPackagesTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing aur_packages_translations items.
         */
        delete: operations["deleteItemsAurPackagesTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple aur_packages_translations items at the same time.
         */
        patch: operations["updateItemsAurPackagesTranslations"];
        trace?: never;
    };
    "/items/aur_packages_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single aur_packages_translations item by unique identifier.
         */
        get: operations["readSingleItemsAurPackagesTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing aur_packages_translations item.
         */
        delete: operations["deleteSingleItemsAurPackagesTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing aur_packages_translations item.
         */
        patch: operations["updateSingleItemsAurPackagesTranslations"];
        trace?: never;
    };
    "/items/pages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the pages items.
         */
        get: operations["readItemsPages"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new pages item.
         */
        post: operations["createItemsPages"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing pages items.
         */
        delete: operations["deleteItemsPages"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple pages items at the same time.
         */
        patch: operations["updateItemsPages"];
        trace?: never;
    };
    "/items/pages/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single pages item by unique identifier.
         */
        get: operations["readSingleItemsPages"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing pages item.
         */
        delete: operations["deleteSingleItemsPages"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing pages item.
         */
        patch: operations["updateSingleItemsPages"];
        trace?: never;
    };
    "/items/pages_translations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the pages_translations items.
         */
        get: operations["readItemsPagesTranslations"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new pages_translations item.
         */
        post: operations["createItemsPagesTranslations"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing pages_translations items.
         */
        delete: operations["deleteItemsPagesTranslations"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple pages_translations items at the same time.
         */
        patch: operations["updateItemsPagesTranslations"];
        trace?: never;
    };
    "/items/pages_translations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single pages_translations item by unique identifier.
         */
        get: operations["readSingleItemsPagesTranslations"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing pages_translations item.
         */
        delete: operations["deleteSingleItemsPagesTranslations"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing pages_translations item.
         */
        patch: operations["updateSingleItemsPagesTranslations"];
        trace?: never;
    };
    "/items/ai_prompts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Items
         * @description List the ai_prompts items.
         */
        get: operations["readItemsAIPrompts"];
        put?: never;
        /**
         * Create an Item
         * @description Create a new ai_prompts item.
         */
        post: operations["createItemsAIPrompts"];
        /**
         * Delete Multiple Items
         * @description Delete multiple existing ai_prompts items.
         */
        delete: operations["deleteItemsAIPrompts"];
        options?: never;
        head?: never;
        /**
         * Update Multiple Items
         * @description Update multiple ai_prompts items at the same time.
         */
        patch: operations["updateItemsAIPrompts"];
        trace?: never;
    };
    "/items/ai_prompts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrieve an Item
         * @description Retrieve a single ai_prompts item by unique identifier.
         */
        get: operations["readSingleItemsAIPrompts"];
        put?: never;
        post?: never;
        /**
         * Delete an Item
         * @description Delete an existing ai_prompts item.
         */
        delete: operations["deleteSingleItemsAIPrompts"];
        options?: never;
        head?: never;
        /**
         * Update an Item
         * @description Update an existing ai_prompts item.
         */
        patch: operations["updateSingleItemsAIPrompts"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Diff: {
            hash?: string;
            diff?: {
                collections?: {
                    collection?: string;
                    diff?: Record<string, never>[];
                }[];
                fields?: {
                    collection?: string;
                    field?: string;
                    diff?: Record<string, never>[];
                }[];
                relations?: {
                    collection?: string;
                    field?: string;
                    related_collection?: string;
                    diff?: Record<string, never>[];
                }[];
            };
        };
        Files: {
            /**
             * @description Unique identifier for the file.
             * @example 8cbb43fe-4cdf-4991-8352-c461779cec02
             */
            id?: string;
            /**
             * @description Where the file is stored. Either `local` for the local filesystem or the name of the storage adapter (for example `s3`).
             * @example local
             */
            storage?: string;
            /**
             * @description Name of the file on disk. By default, Directus uses a random hash for the filename.
             * @example a88c3b72-ac58-5436-a4ec-b2858531333a.jpg
             */
            filename_disk?: string;
            /**
             * @description How you want to the file to be named when it's being downloaded.
             * @example avatar.jpg
             */
            filename_download?: string;
            /**
             * @description Title for the file. Is extracted from the filename on upload, but can be edited by the user.
             * @example User Avatar
             */
            title?: string;
            /**
             * @description MIME type of the file.
             * @example image/jpeg
             */
            type?: string;
            /**
             * @description Virtual folder where this file resides in.
             * @example null
             */
            folder?: (string | components["schemas"]["Folders"]) | null;
            /**
             * @description Who uploaded the file.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            uploaded_by?: string | components["schemas"]["Users"];
            /**
             * Format: date-time
             * @description When the file was created.
             * @example 2019-12-03T00:10:15+00:00
             */
            created_on?: string;
            modified_by?: (string | components["schemas"]["Users"]) | null;
            /** Format: timestamp */
            modified_on?: string;
            /**
             * @description Character set of the file.
             * @example binary
             */
            charset?: string | null;
            /**
             * @description Size of the file in bytes.
             * @example 137862
             */
            filesize?: number;
            /**
             * @description Width of the file in pixels. Only applies to images.
             * @example 800
             */
            width?: number | null;
            /**
             * @description Height of the file in pixels. Only applies to images.
             * @example 838
             */
            height?: number | null;
            /**
             * @description Duration of the file in seconds. Only applies to audio and video.
             * @example 0
             */
            duration?: number | null;
            /**
             * @description Where the file was embedded from.
             * @example null
             */
            embed?: string | null;
            /** @description Description for the file. */
            description?: string | null;
            /** @description Where the file was created. Is automatically populated based on Exif data for images. */
            location?: string | null;
            /** @description Tags for the file. Is automatically populated based on Exif data for images. */
            tags?: string[] | null;
            /** @description IPTC, Exif, and ICC metadata extracted from file */
            metadata?: Record<string, never> | null;
            focal_point_x?: number | null;
            focal_point_y?: number | null;
            tus_id?: string | null;
            tus_data?: unknown;
            /**
             * Format: date-time
             * @description When the file was last uploaded/replaced.
             * @example 2019-12-03T00:10:15+00:00
             */
            uploaded_on?: string;
        };
        Folders: {
            /**
             * @description Unique identifier for the folder.
             * @example 0cf0e03d-4364-45df-b77b-ca61f61869d2
             */
            id?: string;
            /**
             * @description Name of the folder.
             * @example New York
             */
            name?: string;
            /**
             * @description Unique identifier of the parent folder. This allows for nested folders.
             * @example null
             */
            parent?: (string | components["schemas"]["Folders"]) | null;
        };
        Roles: {
            /**
             * @description Unique identifier for the role.
             * @example 2f24211d-d928-469a-aea3-3c8f53d4e426
             */
            id?: string;
            /**
             * @description Name of the role.
             * @example Administrator
             */
            name?: string;
            /**
             * @description The role's icon.
             * @example verified_user
             */
            icon?: string;
            /**
             * @description Description of the role.
             * @example Admins have access to all managed data within the system by default
             */
            description?: string | null;
            /** @description $t:field_options.directus_roles.parent_note */
            parent?: (string | components["schemas"]["Roles"]) | null;
            /** @description $t:field_options.directus_roles.children_note */
            children?: (string | components["schemas"]["Roles"])[] | null;
            policies?: unknown;
            users?: (string | components["schemas"]["Users"])[] | null;
        };
        Schema: {
            /** @example 1 */
            version?: number;
            directus?: string;
            vendor?: string;
            collections?: components["schemas"]["Collections"][];
            fields?: components["schemas"]["Fields"][];
            relations?: components["schemas"]["Relations"][];
        };
        Users: {
            /**
             * @description Unique identifier for the user.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            id?: string;
            /**
             * @description First name of the user.
             * @example Admin
             */
            first_name?: string;
            /**
             * @description Last name of the user.
             * @example User
             */
            last_name?: string;
            /**
             * Format: email
             * @description Unique email address for the user.
             * @example admin@example.com
             */
            email?: string;
            /** @description Password of the user. */
            password?: string;
            /**
             * @description The user's location.
             * @example null
             */
            location?: string | null;
            /**
             * @description The user's title.
             * @example null
             */
            title?: string | null;
            /**
             * @description The user's description.
             * @example null
             */
            description?: string | null;
            /**
             * @description The user's tags.
             * @example null
             */
            tags?: string[] | null;
            /**
             * @description The user's avatar.
             * @example null
             */
            avatar?: (string | components["schemas"]["Files"]) | null;
            /**
             * @description The user's language used in Directus.
             * @example en-US
             */
            language?: string;
            /**
             * @description The 2FA secret string that's used to generate one time passwords.
             * @example null
             */
            tfa_secret?: string | null;
            /**
             * @description Status of the user.
             * @example active
             * @enum {string}
             */
            status?: "active" | "invited" | "draft" | "suspended" | "deleted";
            /**
             * @description Unique identifier of the role of this user.
             * @example 2f24211d-d928-469a-aea3-3c8f53d4e426
             */
            role?: string | components["schemas"]["Roles"];
            /** @description Static token for the user. */
            token?: string | null;
            /**
             * Format: date-time
             * @description When this user used the API last.
             * @example 2020-05-31T14:32:37Z
             */
            last_access?: string | null;
            /**
             * @description Last page that the user was on.
             * @example /my-project/settings/collections/a
             */
            last_page?: string | null;
            provider?: string;
            external_identifier?: string | null;
            auth_data?: unknown;
            email_notifications?: boolean | null;
            appearance?: string | null;
            theme_dark?: string | null;
            theme_light?: string | null;
            theme_light_overrides?: unknown;
            theme_dark_overrides?: unknown;
            text_direction?: string;
            policies?: unknown;
        };
        Query: {
            /**
             * @description Control what fields are being returned in the object.
             * @example [
             *       "*",
             *       "*.*"
             *     ]
             */
            fields?: string[];
            /**
             * @example {
             *       "<field>": {
             *         "<operator>": "<value>"
             *       }
             *     }
             */
            filter?: Record<string, never>;
            /** @description Filter by items that contain the given search query in one of their fields. */
            search?: string;
            /**
             * @description How to sort the returned items.
             * @example [
             *       "-date_created"
             *     ]
             */
            sort?: string[];
            /** @description Set the maximum number of items that will be returned */
            limit?: number;
            /** @description How many items to skip when fetching data. */
            offset?: number;
            /** @description Cursor for use in pagination. Often used in combination with limit. */
            page?: number;
            /**
             * @description Deep allows you to set any of the other query parameters on a nested relational dataset.
             * @example {
             *       "related_articles": {
             *         "_limit": 3
             *       }
             *     }
             */
            deep?: Record<string, never>;
        };
        "x-metadata": {
            /** @description Returns the total item count of the collection you're querying. */
            total_count?: number;
            /** @description Returns the item count of the collection you're querying, taking the current filter/search parameters into account. */
            filter_count?: number;
        };
        Collections: {
            /**
             * @description The collection key.
             * @example customers
             */
            collection?: string;
            icon?: string | null;
            note?: string | null;
            display_template?: string | null;
            hidden?: boolean;
            singleton?: boolean;
            translations?: unknown;
            archive_field?: string | null;
            archive_app_filter?: boolean;
            archive_value?: string | null;
            unarchive_value?: string | null;
            sort_field?: string | null;
            accountability?: string | null;
            color?: string | null;
            item_duplication_fields?: unknown;
            sort?: number | null;
            group?: (string | components["schemas"]["Collections"]) | null;
            collapse?: string;
            preview_url?: string | null;
            versioning?: boolean;
        };
        Fields: {
            id?: number;
            /**
             * @description Unique name of the collection this field is in.
             * @example about_us
             */
            collection?: string;
            /**
             * @description Unique name of the field. Field name is unique within the collection.
             * @example id
             */
            field?: string;
            special?: string[] | null;
            interface?: string | null;
            options?: unknown;
            display?: string | null;
            display_options?: unknown;
            readonly?: boolean;
            hidden?: boolean;
            sort?: number | null;
            width?: string | null;
            translations?: unknown;
            note?: string | null;
            conditions?: unknown;
            required?: boolean | null;
            group?: (number | components["schemas"]["Fields"]) | null;
            validation?: unknown;
            validation_message?: string | null;
        };
        Activity: {
            /**
             * @description Unique identifier for the object.
             * @example 2
             */
            id?: number;
            /**
             * @description Action that was performed.
             * @example update
             * @enum {string}
             */
            action?: "create" | "update" | "delete" | "login";
            /** @description The user who performed this action. */
            user?: (string | components["schemas"]["Users"]) | null;
            /**
             * Format: date-time
             * @description When the action happened.
             * @example 2019-12-05T22:52:09Z
             */
            timestamp?: string;
            /**
             * @description The IP address of the user at the time the action took place.
             * @example 127.0.0.1
             */
            ip?: string;
            /**
             * @description User agent string of the browser the user used when the action took place.
             * @example Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/78.0.3904.108 Safari/537.36
             */
            user_agent?: string;
            /** @description Collection identifier in which the item resides. */
            collection?: string | components["schemas"]["Collections"];
            /**
             * @description Unique identifier for the item the action applied to. This is always a string, even for integer primary keys.
             * @example 328
             */
            item?: string;
            /**
             * @description Origin of the request when the action took place.
             * @example https://directus.io
             */
            origin?: string;
            revisions?: (number | components["schemas"]["Revisions"])[] | null;
        };
        Revisions: {
            /**
             * @description Unique identifier for the revision.
             * @example 1
             */
            id?: number;
            /**
             * @description Unique identifier for the activity record.
             * @example 2
             */
            activity?: number | components["schemas"]["Activity"];
            /**
             * @description Collection of the updated item.
             * @example articles
             */
            collection?: string | components["schemas"]["Collections"];
            /**
             * @description Primary key of updated item.
             * @example 168
             */
            item?: string;
            /**
             * @description Copy of item state at time of update.
             * @example {
             *       "author": 1,
             *       "body": "This is my first post",
             *       "featured_image": 15,
             *       "id": "168",
             *       "title": "Hello, World!"
             *     }
             */
            data?: Record<string, never> | null;
            /**
             * @description Changes between the previous and the current revision.
             * @example {
             *       "title": "Hello, World!"
             *     }
             */
            delta?: Record<string, never>;
            /**
             * @description If the current item was updated relationally, this is the id of the parent revision record
             * @example null
             */
            parent?: number | null;
            /**
             * @description Associated version of this revision.
             * @example draft
             */
            version?: string | components["schemas"]["Versions"];
        };
        Relations: {
            /**
             * @description Unique identifier for the relation.
             * @example 1
             */
            id?: number;
            /**
             * @description Collection that has the field that holds the foreign key.
             * @example directus_activity
             */
            many_collection?: string;
            /**
             * @description Foreign key. Field that holds the primary key of the related collection.
             * @example user
             */
            many_field?: string;
            /**
             * @description Collection on the _one_ side of the relationship.
             * @example directus_users
             */
            one_collection?: string;
            /**
             * @description Alias column that serves as the _one_ side of the relationship.
             * @example null
             */
            one_field?: string | null;
            one_collection_field?: string | null;
            one_allowed_collections?: string[] | null;
            /**
             * @description Field on the junction table that holds the many field of the related relation.
             * @example null
             */
            junction_field?: string | null;
            sort_field?: string | null;
            one_deselect_action?: string;
        };
        Permissions: {
            /**
             * @description Unique identifier for the permission.
             * @example 1
             */
            id?: number;
            /**
             * @description What collection this permission applies to.
             * @example customers
             */
            collection?: string;
            /**
             * @description What action this permission applies to.
             * @example create
             * @enum {string}
             */
            action?: "create" | "read" | "update" | "delete";
            /** @description JSON structure containing the permissions checks for this permission. */
            permissions?: Record<string, never> | null;
            /** @description JSON structure containing the validation checks for this permission. */
            validation?: Record<string, never> | null;
            /** @description JSON structure containing the preset value for created/updated items. */
            presets?: Record<string, never> | null;
            /** @description CSV of fields that the user is allowed to interact with. */
            fields?: string[] | null;
            policy?: unknown;
        };
        Presets: {
            /**
             * @description Unique identifier for this single collection preset.
             * @example 155
             */
            id?: number;
            /** @description Name for the bookmark. If this is set, the preset will be considered a bookmark. */
            bookmark?: string | null;
            /**
             * @description The unique identifier of the user to whom this collection preset applies.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            user?: (string | components["schemas"]["Users"]) | null;
            /**
             * @description The unique identifier of a role in the platform. If `user` is null, this will be used to apply the collection preset or bookmark for all users in the role.
             * @example 50419801-0f30-8644-2b3c-9bc2d980d0a0
             */
            role?: (string | components["schemas"]["Roles"]) | null;
            /**
             * @description What collection this collection preset is used for.
             * @example articles
             */
            collection?: string | components["schemas"]["Collections"];
            /** @description Search query. */
            search?: string | null;
            /**
             * @description Key of the layout that is used.
             * @example null
             */
            layout?: string;
            /**
             * @description Layout query that's saved per layout type. Controls what data is fetched on load. These follow the same format as the JS SDK parameters.
             * @example {
             *       "cards": {
             *         "sort": "-published_on"
             *       }
             *     }
             */
            layout_query?: unknown;
            /**
             * @description Options of the views. The properties in here are controlled by the layout.
             * @example {
             *       "cards": {
             *         "icon": "account_circle",
             *         "title": "{{ first_name }} {{ last_name }}",
             *         "subtitle": "{{ title }}",
             *         "size": 3
             *       }
             *     }
             */
            layout_options?: unknown;
            refresh_interval?: number | null;
            filter?: unknown;
            icon?: string | null;
            color?: string | null;
        };
        Webhooks: {
            /**
             * @description The index of the webhook.
             * @example 1
             */
            id?: number;
            /**
             * @description The name of the webhook.
             * @example create articles
             */
            name?: string;
            /**
             * @description Method used in the webhook.
             * @example POST
             */
            method?: string;
            /**
             * @description The url of the webhook.
             * @example null
             */
            url?: string | null;
            /**
             * @description The status of the webhook.
             * @example inactive
             */
            status?: string;
            /**
             * @description If yes, send the content of what was done
             * @example true
             */
            data?: boolean;
            /**
             * @description The actions that triggers this webhook.
             * @example null
             */
            actions?: string[] | null;
            collections?: string[];
            headers?: unknown;
            was_active_before_deprecation?: boolean;
            migrated_flow?: (string | components["schemas"]["Flows"]) | null;
        };
        Flows: {
            /**
             * @description Unique identifier for the flow.
             * @example 2f24211d-d928-469a-aea3-3c8f53d4e426
             */
            id?: string;
            /**
             * @description The name of the flow.
             * @example Update Articles Flow
             */
            name?: string;
            /**
             * @description Icon displayed in the Admin App for the flow.
             * @example bolt
             */
            icon?: string;
            /**
             * @description Color of the icon displayed in the Admin App for the flow.
             * @example #112233
             */
            color?: string | null;
            description?: string | null;
            /**
             * @description Current status of the flow.
             * @default active
             * @example active
             * @enum {string}
             */
            status?: "active" | "inactive";
            /**
             * @description Type of trigger for the flow. One of `hook`, `webhook`, `operation`, `schedule`, `manual`.
             * @example manual
             */
            trigger?: string;
            /**
             * @description The permission used during the flow. One of `$public`, `$trigger`, `$full`, or UUID of a role.
             * @example $trigger
             */
            accountability?: string;
            /**
             * @description Options of the selected trigger for the flow.
             * @example null
             */
            options?: Record<string, never> | null;
            /**
             * @description UUID of the operation connected to the trigger in the flow.
             * @example 92e82998-e421-412f-a513-13701e83e4ce
             */
            operation?: string | components["schemas"]["Operations"];
            /**
             * Format: date-time
             * @description Timestamp in ISO8601 when the flow was created.
             * @example 2022-05-11T13:14:52Z
             */
            date_created?: string | null;
            /**
             * @description The user who created the flow.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            user_created?: string | components["schemas"]["Users"];
            operations?: (string | components["schemas"]["Operations"])[] | null;
        };
        Operations: {
            /**
             * @description Unique identifier for the operation.
             * @example 2f24211d-d928-469a-aea3-3c8f53d4e426
             */
            id?: string;
            /**
             * @description The name of the operation.
             * @example Log to Console
             */
            name?: string;
            /**
             * @description Key for the operation. Must be unique within a given flow.
             * @example log_console
             */
            key?: string;
            /**
             * @description Type of operation. One of `log`, `mail`, `notification`, `create`, `read`, `request`, `sleep`, `transform`, `trigger`, `condition`, or any type of custom operation extensions.
             * @example log
             */
            type?: string;
            /**
             * @description Position of the operation on the X axis within the flow workspace.
             * @example 12
             */
            position_x?: number;
            /**
             * @description Position of the operation on the Y axis within the flow workspace.
             * @example 12
             */
            position_y?: number;
            /**
             * @description Options depending on the type of the operation.
             * @example null
             */
            options?: Record<string, never> | null;
            /**
             * @description The operation triggered when the current operation succeeds (or `then` logic of a condition operation).
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            resolve?: string | components["schemas"]["Operations"];
            /**
             * @description The operation triggered when the current operation fails (or `otherwise` logic of a condition operation).
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            reject?: string | components["schemas"]["Operations"];
            flow?: string | components["schemas"]["Flows"];
            /**
             * Format: date-time
             * @description Timestamp in ISO8601 when the operation was created.
             * @example 2022-05-11T13:14:52Z
             */
            date_created?: string | null;
            /**
             * @description The user who created the operation.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            user_created?: string | components["schemas"]["Users"];
        };
        Comments: {
            /**
             * @description Unique identifier for this single collection preset.
             * @example 81dfa7e0-56d2-471f-b96a-1cf8a62bdf28
             */
            id?: string;
            /**
             * @description The collection of the item the Comment is created for.
             * @example articles
             */
            collection?: string | components["schemas"]["Collections"];
            /**
             * @description The item the Comment is created for.
             * @example 123
             */
            item?: string;
            /**
             * @description User comment. This will store the comments that show up in the right sidebar of the item edit page in the admin app.
             * @example This is a comment
             */
            comment?: string;
            /**
             * Format: date-time
             * @description When the Comment was created.
             * @example 2024-01-23T12:34:56Z
             */
            date_created?: string | null;
            /**
             * Format: date-time
             * @description When the Comment was updated.
             * @example 2024-01-23T12:34:56Z
             */
            date_updated?: string | null;
            /**
             * @description User that created the Comment.
             * @example 81dfa7e0-56d2-471f-b96a-1cf8a62bdf28
             */
            user_created?: string | components["schemas"]["Users"];
            /**
             * @description User that updated the Comment.
             * @example 81dfa7e0-56d2-471f-b96a-1cf8a62bdf28
             */
            user_updated?: string | components["schemas"]["Users"];
        };
        Versions: {
            /**
             * @description Primary key of the Content Version.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            id?: string;
            /**
             * @description Key of the Content Version, used as the value for the "version" query parameter.
             * @example draft
             */
            key?: string;
            /**
             * @description Descriptive name of the Content Version.
             * @example My Draft
             */
            name?: string;
            /**
             * @description Name of the collection the Content Version is created on.
             * @example articles
             */
            collection?: string | components["schemas"]["Collections"];
            /**
             * @description The item the Content Version is created on.
             * @example 168
             */
            item?: string;
            hash?: string | null;
            /**
             * Format: date-time
             * @description When the Content Version was created.
             * @example 2022-05-11T13:14:52Z
             */
            date_created?: string | null;
            /**
             * Format: date-time
             * @description When the Content Version was last updated.
             * @example 2022-05-11T13:14:53Z
             */
            date_updated?: string | null;
            /**
             * @description User that created the Content Version.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            user_created?: string | components["schemas"]["Users"];
            /**
             * @description User that last updated the Content Version.
             * @example 63716273-0f29-4648-8a2a-2af2948f6f78
             */
            user_updated?: string | components["schemas"]["Users"];
            /**
             * @description The current changes compared to the main version of the item.
             * @example {
             *       "my_field": "Updated Value"
             *     }
             */
            delta?: Record<string, never>;
        };
        Extensions: {
            enabled?: boolean;
            /** Format: uuid */
            id?: string;
            folder?: string;
            source?: string;
            /**
             * @description Name of the bundle the extension is in.
             * @example directus-extension-my-bundle
             */
            bundle?: string | null;
        };
        Settings: {
            /**
             * @description Unique identifier for the setting.
             * @example 1
             */
            id?: number;
            /**
             * @description The name of the project.
             * @example Directus
             */
            project_name?: string;
            /**
             * @description The url of the project.
             * @example null
             */
            project_url?: string | null;
            /**
             * @description The brand color of the project.
             * @example null
             */
            project_color?: string | null;
            /**
             * @description The logo of the project.
             * @example null
             */
            project_logo?: string | null;
            /**
             * @description The foreground of the project.
             * @example null
             */
            public_foreground?: string | null;
            /**
             * @description The background of the project.
             * @example null
             */
            public_background?: {
                id?: string;
                type?: string;
            } | null;
            /**
             * @description Note rendered on the public pages of the app.
             * @example null
             */
            public_note?: string | null;
            /**
             * @description Allowed authentication login attempts before the user's status is set to blocked.
             * @example 25
             */
            auth_login_attempts?: number;
            /** @description Authentication password policy. */
            auth_password_policy?: string | null;
            /**
             * @description What transformations are allowed in the assets endpoint.
             * @example all
             * @enum {string|null}
             */
            storage_asset_transform?: "all" | "none" | "presets" | null;
            /**
             * @description Array of allowed
             * @example null
             */
            storage_asset_presets?: {
                /** @description Key for the asset. Used in the assets endpoint. */
                key?: string;
                /**
                 * @description Whether to crop the thumbnail to match the size, or maintain the aspect ratio.
                 * @enum {string}
                 */
                fit?: "cover" | "contain" | "inside" | "outside";
                /** @description Width of the thumbnail. */
                width?: number;
                /** @description Height of the thumbnail. */
                height?: number;
                /** @description No image upscale */
                withoutEnlargement?: boolean;
                /** @description Quality of the compression used. */
                quality?: number;
                /**
                 * @description Reformat output image
                 * @enum {string}
                 */
                format?: "" | "jpeg" | "png" | "webp" | "tiff" | "avif";
                /** @description Additional transformations to apply */
                transforms?: {
                    /** @description The Sharp method name */
                    method?: string;
                    /** @description A list of arguments to pass to the Sharp method */
                    arguments?: {
                        /** @description A JSON representation of the argument value */
                        argument?: string;
                    }[] | null;
                }[] | null;
            }[] | null;
            custom_css?: string | null;
            /**
             * Format: uuid
             * @description Default folder to place files
             */
            storage_default_folder?: string;
            basemaps?: unknown;
            mapbox_key?: string | null;
            module_bar?: unknown;
            project_descriptor?: string | null;
            default_language?: string;
            custom_aspect_ratios?: unknown;
            /** @description $t:field_options.directus_settings.project_favicon_note */
            public_favicon?: (string | components["schemas"]["Files"]) | null;
            default_appearance?: string;
            default_theme_light?: string | null;
            theme_light_overrides?: unknown;
            default_theme_dark?: string | null;
            theme_dark_overrides?: unknown;
            report_error_url?: string | null;
            report_bug_url?: string | null;
            report_feature_url?: string | null;
            /** @description $t:fields.directus_settings.public_registration_note */
            public_registration?: boolean;
            /** @description $t:fields.directus_settings.public_registration_verify_email_note */
            public_registration_verify_email?: boolean;
            /** @description $t:fields.directus_settings.public_registration_role_note */
            public_registration_role?: (string | components["schemas"]["Roles"]) | null;
            /** @description $t:fields.directus_settings.public_registration_email_filter_note */
            public_registration_email_filter?: unknown;
            visual_editor_urls?: unknown;
            accepted_terms?: boolean | null;
            /** Format: uuid */
            project_id?: string | null;
            /** @description $t:fields.directus_settings.mcp_enabled_note */
            mcp_enabled?: boolean;
            /** @description $t:fields.directus_settings.mcp_allow_deletes_note */
            mcp_allow_deletes?: boolean;
            /** @description $t:fields.directus_settings.mcp_prompts_collection_note */
            mcp_prompts_collection?: string | null;
            /** @description $t:fields.directus_settings.mcp_system_prompt_enabled_note */
            mcp_system_prompt_enabled?: boolean;
            /** @description $t:fields.directus_settings.mcp_system_prompt_note */
            mcp_system_prompt?: string | null;
        };
        ItemsCategories: {
            id?: number;
            sort?: number | null;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsCategoriesTranslations"])[] | null;
        };
        ItemsSiteSettings: {
            id?: number;
            site_name?: string;
            /** @description 默认 OG 分享图 */
            og_image?: (string | components["schemas"]["Files"]) | null;
            /** @description GitHub 组织/账户链接 */
            social_github?: string | null;
            social_x?: string | null;
            social_email?: string | null;
            social_discord?: string | null;
            /** @description 自定义 RSS URL,留空则用站点自动生成 */
            rss_url?: string | null;
            established_year?: number | null;
            location?: string | null;
            /** @description 关注方向,如 "FULL-STACK / RUST / GO" */
            focus?: string | null;
            /** @description GitHub 总 star 数(冗余,seed 自动回填) */
            total_stars?: number | null;
            contributors?: number | null;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsSiteSettingsTranslations"])[] | null;
        };
        ItemsAuthors: {
            id?: number;
            sort?: number | null;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            name: string;
            /** @description 头像 */
            avatar?: (string | components["schemas"]["Files"]) | null;
            github?: string | null;
            x?: string | null;
            email?: string | null;
            /** Format: timestamp */
            date_created?: string | null;
            /** Format: timestamp */
            date_updated?: string | null;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsAuthorsTranslations"])[] | null;
        };
        ItemsCategoriesTranslations: {
            id?: number;
            categories_id?: (number | components["schemas"]["ItemsCategories"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            name: string;
            description?: string | null;
        };
        ItemsLanguages: {
            /** @description BCP 47 语言代码,如 "zh-CN" */
            code: string;
            name: string;
            direction?: string;
        };
        ItemsSiteSettingsTranslations: {
            id?: number;
            site_settings_id?: (number | components["schemas"]["ItemsSiteSettings"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            /** @description 一句话副标题,如 "全栈实验室" */
            tagline: string;
            description?: string | null;
        };
        ItemsAuthorsTranslations: {
            id?: number;
            authors_id?: (number | components["schemas"]["ItemsAuthors"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            bio?: string | null;
        };
        ItemsTags: {
            id?: number;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsTagsTranslations"])[] | null;
        };
        ItemsTagsTranslations: {
            id?: number;
            tags_id?: (number | components["schemas"]["ItemsTags"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            name: string;
        };
        ItemsProjects: {
            id?: number;
            status?: string;
            sort?: number | null;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            name: string;
            cover?: (string | components["schemas"]["Files"]) | null;
            /** @description 技术栈标签数组,如 ["Go", "Rust"] */
            tech_stack?: unknown;
            kind?: string | null;
            github_url?: string | null;
            demo_url?: string | null;
            docs_url?: string | null;
            npm_url?: string | null;
            stars?: number | null;
            forks?: number | null;
            featured?: boolean;
            /** Format: timestamp */
            date_created?: string | null;
            /** Format: timestamp */
            date_updated?: string | null;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsProjectsTranslations"])[] | null;
        };
        ItemsPosts: {
            id?: number;
            status?: string;
            sort?: number | null;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            /** @description 封面图 */
            cover?: (string | components["schemas"]["Files"]) | null;
            /** @description 阅读时长(分钟) */
            reading_time?: number | null;
            featured?: boolean;
            /** Format: timestamp */
            date_published?: string | null;
            /** Format: timestamp */
            date_created?: string | null;
            /** Format: timestamp */
            date_updated?: string | null;
            author?: (number | components["schemas"]["ItemsAuthors"]) | null;
            category?: (number | components["schemas"]["ItemsCategories"]) | null;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsPostsTranslations"])[] | null;
            tags?: (number | components["schemas"]["ItemsPostsTags"])[] | null;
        };
        ItemsProjectsTranslations: {
            id?: number;
            projects_id?: (number | components["schemas"]["ItemsProjects"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            /** @description 短描述(卡片用) */
            description: string;
            /** @description 长介绍(Markdown,详情页用) */
            content?: string | null;
            /** @description 高亮点列表,如 ["零依赖", "21x 更快"] */
            highlights?: unknown;
        };
        ItemsPostsTranslations: {
            id?: number;
            posts_id?: (number | components["schemas"]["ItemsPosts"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            title: string;
            excerpt?: string | null;
            content?: string | null;
            /** @description 列表占位图上的大字标签(如 v1.0 Release) */
            cover_label?: string | null;
            seo_title?: string | null;
            seo_description?: string | null;
        };
        ItemsAurPackages: {
            id?: number;
            status?: string;
            sort?: number | null;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            /** @description AUR 官方包名,如 zerx-lab-pencil-bin */
            name: string;
            version?: string | null;
            maintained?: boolean;
            badges?: unknown;
            aur_url?: string | null;
            upstream_url?: string | null;
            /** Format: timestamp */
            date_created?: string | null;
            /** Format: timestamp */
            date_updated?: string | null;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsAurPackagesTranslations"])[] | null;
        };
        ItemsPostsTags: {
            id?: number;
            posts_id?: (number | components["schemas"]["ItemsPosts"]) | null;
            tags_id?: (number | components["schemas"]["ItemsTags"]) | null;
        };
        ItemsAurPackagesTranslations: {
            id?: number;
            aur_packages_id?: (number | components["schemas"]["ItemsAurPackages"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            description: string;
        };
        ItemsPages: {
            id?: number;
            status?: string;
            /** @description URL 安全 slug,用作路由 */
            slug: string;
            /** Format: timestamp */
            date_created?: string | null;
            /** Format: timestamp */
            date_updated?: string | null;
            /** @description 多语言字段(Directus 原生 translations interface) */
            translations?: (number | components["schemas"]["ItemsPagesTranslations"])[] | null;
        };
        ItemsPagesTranslations: {
            id?: number;
            pages_id?: (number | components["schemas"]["ItemsPages"]) | null;
            languages_code?: (string | components["schemas"]["ItemsLanguages"]) | null;
            title: string;
            content?: string | null;
        };
        ItemsAIPrompts: {
            id?: number;
            /** @description Prompt 标识,建议用 slug 风格(小写 + 连字符) */
            name: string;
            /** @description Prompt 的简短说明,供 AI 客户端展示 */
            description?: string | null;
            /** @description System prompt 内容(Markdown) */
            system_prompt?: string | null;
            /** @description Prompt 的 role/text 消息序列 */
            messages?: unknown;
        };
    };
    responses: {
        /** @description Error: Not found. */
        NotFoundError: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    error?: {
                        /** Format: int64 */
                        code?: number;
                        message?: string;
                    };
                };
            };
        };
        /** @description Error: Unauthorized request */
        UnauthorizedError: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    error?: {
                        /** Format: int64 */
                        code?: number;
                        message?: string;
                    };
                };
            };
        };
    };
    parameters: {
        /** @description Index */
        Id: number;
        /** @description Unique identifier for the object. */
        UUId: string;
        /** @description Collection of which you want to retrieve the items from. */
        Collection: string;
        /** @description Filter by items that contain the given search query in one of their fields. */
        Search: string;
        /** @description Cursor for use in pagination. Often used in combination with limit. */
        Page: number;
        /** @description How many items to skip when fetching data. */
        Offset: number;
        /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
        Sort: string[];
        /** @description What metadata to return in the response. */
        Meta: string;
        /** @description A limit on the number of objects that are returned. */
        Limit: number;
        /** @description Select items in collection by given conditions. */
        Filter: string;
        /** @description Control what fields are being returned in the object. */
        Fields: string[];
        /** @description Saves the API response to a file. Accepts one of "csv", "json", "xml", "yaml". */
        Export: "csv" | "json" | "xml" | "yaml";
        /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
        Version: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getAsset: {
        parameters: {
            query?: {
                /** @description The key of the asset size configured in settings. */
                key?: string;
                /** @description A JSON array of image transformations */
                transforms?: string;
                /** @description Download the asset to your computer */
                download?: boolean;
            };
            header?: never;
            path: {
                /** @description The id of the file. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            404: components["responses"]["NotFoundError"];
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Email address of the user you're retrieving the access token for.
                     * @example admin@example.com
                     */
                    email: string;
                    /**
                     * Format: password
                     * @description Password of the user.
                     * @example password
                     */
                    password: string;
                    /**
                     * @description Whether to retrieve the refresh token in the JSON response, or in a httpOnly cookie.
                     * @default json
                     * @enum {string}
                     */
                    mode?: "json" | "cookie" | "session";
                    /** @description The user's one-time-password (if MFA is enabled). */
                    otp?: string;
                };
            };
        };
        responses: {
            /** @description Successful authentification */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            /** @example eyJhbGciOiJI... */
                            access_token?: string;
                            /** @example 900 */
                            expires?: number;
                            /** @example yuOJkjdPXMd... */
                            refresh_token?: string;
                        };
                    };
                };
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description JWT access token you want to refresh. This token can't be expired.
                     * @example eyJ0eXAiOiJKV...
                     */
                    refresh_token?: string;
                    /**
                     * @description Whether to submit and retrieve the refresh token in the JSON response, or in a httpOnly cookie.
                     * @default json
                     * @enum {string}
                     */
                    mode?: "json" | "cookie" | "session";
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: {
                            /** @example eyJhbGciOiJI... */
                            access_token?: string;
                            /** @example 900 */
                            expires?: number;
                            /** @example Gy-caJMpmGTA... */
                            refresh_token?: string;
                        };
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description The refresh token to invalidate. If you have the refresh token in a cookie through /auth/login, you don't have to submit it here.
                     * @example eyJ0eXAiOiJKV...
                     */
                    refresh_token?: string;
                    /**
                     * @description Whether the refresh token is submitted in the JSON response, or in a httpOnly cookie.
                     * @enum {string}
                     */
                    mode?: "json" | "cookie" | "session";
                };
            };
        };
        responses: {
            /** @description Request successful */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    passwordRequest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Email address of the user you're requesting a reset for.
                     * @example admin@example.com
                     */
                    email: string;
                };
            };
        };
        responses: {
            401: components["responses"]["UnauthorizedError"];
        };
    };
    passwordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description One-time use JWT token that is used to verify the user.
                     * @example eyJ0eXAiOiJKV1Qi...
                     */
                    token: string;
                    /**
                     * Format: password
                     * @description New password for the user.
                     * @example password
                     */
                    password: string;
                };
            };
        };
        responses: {
            401: components["responses"]["UnauthorizedError"];
        };
    };
    oauth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        public?: boolean;
                        /**
                         * @example [
                         *       "github",
                         *       "facebook"
                         *     ]
                         */
                        data?: string[];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    oauthProvider: {
        parameters: {
            query?: {
                /** @description Where to redirect on successful login.<br/>If set the authentication details are set inside cookies otherwise a JSON is returned. */
                redirect?: string;
            };
            header?: never;
            path: {
                /** @description Key of the activated OAuth provider. */
                provider: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        public?: boolean;
                        data?: {
                            token?: string;
                        };
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    schemaSnapshot: {
        parameters: {
            query?: {
                /** @description Saves the API response to a file. Accepts one of "csv", "json", "xml", "yaml". */
                export?: components["parameters"]["Export"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Schema"];
                    };
                    "text/yaml": string;
                };
            };
            403: components["responses"]["UnauthorizedError"];
        };
    };
    schemaApply: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    data?: components["schemas"]["Diff"];
                };
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["UnauthorizedError"];
        };
    };
    schemaDiff: {
        parameters: {
            query?: {
                /** @description Bypass version and database vendor restrictions. */
                force?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    data?: components["schemas"]["Schema"];
                };
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Diff"];
                    };
                };
            };
            /** @description No schema difference. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: components["responses"]["UnauthorizedError"];
        };
    };
    serverInfo: {
        parameters: {
            query: {
                /** @description The first time you create a project, the provided token will be saved and required for subsequent project installs. It can also be found and configured in `/config/__api.json` on your server. */
                super_admin_token: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: Record<string, never>;
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    ping: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/text": string;
                };
            };
        };
    };
    "hash-generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description String to hash. */
                    string: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example $argon2i$v=19$m=4096,t=3,p=1$pOyIa/zmRAjCVLb2f7kOyg$DasoO6LzMM+6iKfzCDq6JbsYsZWLSm33p7i9NxL9mDc */
                        data?: string;
                    };
                };
            };
        };
    };
    "hash-verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description String to hash. */
                    string: string;
                    /** @description Hash you want to verify against. */
                    hash: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example true */
                        data?: boolean;
                    };
                };
            };
        };
    };
    sort: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Collection identifier */
                collection: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Primary key of item to move */
                    item?: number;
                    /** @description Primary key of item where to move the current item to */
                    to?: number;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    import: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Collection identifier */
                collection: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    export: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Collection identifier */
                collection: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description What file format to save the export to. One of csv, xml, json
                     * @enum {string}
                     */
                    format: "csv" | "xml" | "json";
                    query: components["schemas"]["Query"];
                    file: components["schemas"]["Files"];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    "clear-cache": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    random: {
        parameters: {
            query?: {
                /** @description Length of the random string. */
                length?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example 1>M3+4oh.S */
                        data?: string;
                    };
                };
            };
        };
    };
    getRoles: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createRole: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Description of the role. */
                    description?: string;
                    /** @description Whether or not this role enforces the use of 2FA. */
                    enforce_tfa?: boolean;
                    /** @description ID used with external services in SCIM. */
                    external_id?: string;
                    /** @description Array of IP addresses that are allowed to connect to the API as a user of this role. */
                    ip_access?: string[];
                    /** @description Custom override for the admin app module bar navigation. */
                    module_listing?: string;
                    /**
                     * @description Name of the role.
                     * @example Interns
                     */
                    name?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteRoles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateRoles: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    keys?: string[];
                    data?: {
                        /** @description Description of the role. */
                        description?: string;
                        /** @description Whether or not this role enforces the use of 2FA. */
                        enforce_tfa?: boolean;
                        /** @description ID used with external services in SCIM. */
                        external_id?: string;
                        /** @description Array of IP addresses that are allowed to connect to the API as a user of this role. */
                        ip_access?: string[];
                        /** @description Custom override for the admin app module bar navigation. */
                        module_listing?: string;
                        /**
                         * @description Name of the role.
                         * @example Interns
                         */
                        name?: string;
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getRole: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateRole: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Description of the role. */
                    description?: string;
                    /** @description Whether or not this role enforces the use of 2FA. */
                    enforce_tfa?: boolean;
                    /** @description ID used with external services in SCIM. */
                    external_id?: string;
                    /** @description Array of IP addresses that are allowed to connect to the API as a user of this role. */
                    ip_access?: string[];
                    /** @description Custom override for the admin app module bar navigation. */
                    module_listing?: string;
                    /** @description Name of the role. */
                    name?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getCollections: {
        parameters: {
            query?: {
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Collections"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createCollection: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Unique name of the collection.
                     * @example my_collection
                     */
                    collection: string;
                    /** @description The fields contained in this collection. See the fields reference for more information. Each individual field requires field, type, and interface to be provided. */
                    fields: Record<string, never>[];
                    /**
                     * @description Name of a Google Material Design Icon that's assigned to this collection.
                     * @example people
                     */
                    icon?: string | null;
                    /**
                     * @description A note describing the collection.
                     * @example null
                     */
                    note?: string | null;
                    /**
                     * @description Text representation of how items from this collection are shown across the system.
                     * @example null
                     */
                    display_template?: string | null;
                    /**
                     * @description Whether or not the collection is hidden from the navigation in the admin app.
                     * @example false
                     */
                    hidden?: boolean;
                    /**
                     * @description Whether or not the collection is treated as a single object.
                     * @example false
                     */
                    singleton?: boolean;
                    /**
                     * @description Key value pairs of how to show this collection's name in different languages in the admin app.
                     * @example null
                     */
                    translation?: string | null;
                    /**
                     * @description Whether or not Content Versioning is enabled for this collection.
                     * @example false
                     */
                    versioning?: boolean;
                    /**
                     * @description What field holds the archive value.
                     * @example null
                     */
                    archive_field?: string | null;
                    /**
                     * @description What value to use for "archived" items.
                     * @example null
                     */
                    archive_app_filter?: string | null;
                    /**
                     * @description What value to use to "unarchive" items.
                     * @example null
                     */
                    archive_value?: string | null;
                    /**
                     * @description Whether or not to show the "archived" filter.
                     * @example null
                     */
                    unarchive_value?: string | null;
                    /**
                     * @description The sort field in the collection.
                     * @example null
                     */
                    sort_field?: string | null;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Collections"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getCollection: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier of the collection. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Collections"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteCollection: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier of the collection. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateCollection: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier of the collection. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Metadata of the collection. */
                    meta?: {
                        /**
                         * @description Name of a Google Material Design Icon that's assigned to this collection.
                         * @example people
                         */
                        icon?: string | null;
                        /**
                         * @description Choose the color for the icon assigned to this collection.
                         * @example #6644ff
                         */
                        color?: string | null;
                        /**
                         * @description A note describing the collection.
                         * @example null
                         */
                        note?: string | null;
                        /**
                         * @description Text representation of how items from this collection are shown across the system.
                         * @example null
                         */
                        display_template?: string | null;
                        /**
                         * @description Whether or not the collection is hidden from the navigation in the admin app.
                         * @example false
                         */
                        hidden?: boolean;
                        /**
                         * @description Whether or not the collection is treated as a single object.
                         * @example false
                         */
                        singleton?: boolean;
                        /**
                         * @description Key value pairs of how to show this collection's name in different languages in the admin app.
                         * @example null
                         */
                        translation?: string | null;
                        /**
                         * @description Whether or not Content Versioning is enabled for this collection.
                         * @example false
                         */
                        versioning?: boolean;
                        /**
                         * @description What field holds the archive value.
                         * @example null
                         */
                        archive_field?: string | null;
                        /**
                         * @description What value to use for "archived" items.
                         * @example null
                         */
                        archive_app_filter?: string | null;
                        /**
                         * @description What value to use to "unarchive" items.
                         * @example null
                         */
                        archive_value?: string | null;
                        /**
                         * @description Whether or not to show the "archived" filter.
                         * @example null
                         */
                        unarchive_value?: string | null;
                        /**
                         * @description The sort field in the collection.
                         * @example null
                         */
                        sort_field?: string | null;
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Collections"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getFields: {
        parameters: {
            query?: {
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Fields"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getCollectionFields: {
        parameters: {
            query?: {
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
            };
            header?: never;
            path: {
                /** @description Unique identifier of the collection the item resides in. */
                collection: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Fields"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createField: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier of the collection the item resides in. */
                collection: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Unique name of the field. Field name is unique within the collection.
                     * @example id
                     */
                    field: string;
                    /**
                     * @description Directus specific data type. Used to cast values in the API.
                     * @example integer
                     */
                    type: string;
                    /** @description The schema info. */
                    schema?: {
                        /**
                         * @description The name of the field.
                         * @example title
                         */
                        name?: string;
                        /**
                         * @description The collection of the field.
                         * @example posts
                         */
                        table?: string;
                        /**
                         * @description The type of the field.
                         * @example string
                         */
                        type?: string;
                        /**
                         * @description The default value of the field.
                         * @example null
                         */
                        default_value?: string | null;
                        /**
                         * @description The max length of the field.
                         * @example null
                         */
                        max_length?: number | null;
                        /**
                         * @description If the field is nullable.
                         * @example false
                         */
                        is_nullable?: boolean;
                        /**
                         * @description If the field is primary key.
                         * @example false
                         */
                        is_primary_key?: boolean;
                        /**
                         * @description If the field has auto increment.
                         * @example false
                         */
                        has_auto_increment?: boolean;
                        /**
                         * @description Related column from the foreign key constraint.
                         * @example null
                         */
                        foreign_key_column?: string | null;
                        /**
                         * @description Related table from the foreign key constraint.
                         * @example null
                         */
                        foreign_key_table?: string | null;
                        /**
                         * @description Comment as saved in the database.
                         * @example null
                         */
                        comment?: string | null;
                        /**
                         * @description Database schema (pg only).
                         * @example public
                         */
                        schema?: string;
                        /**
                         * @description Related schema from the foreign key constraint (pg only).
                         * @example null
                         */
                        foreign_key_schema?: string | null;
                    };
                    /** @description The meta info. */
                    meta?: {
                        /**
                         * @description Unique identifier for the field in the `directus_fields` collection.
                         * @example 3
                         */
                        id?: number;
                        /**
                         * @description Unique name of the collection this field is in.
                         * @example posts
                         */
                        collection?: string;
                        /**
                         * @description Unique name of the field. Field name is unique within the collection.
                         * @example title
                         */
                        field?: string;
                        /**
                         * @description Transformation flag for field
                         * @example null
                         */
                        special?: string[] | null;
                        /**
                         * @description What interface is used in the admin app to edit the value for this field.
                         * @example primary-key
                         */
                        "system-interface"?: string | null;
                        /**
                         * @description Options for the interface that's used. This format is based on the individual interface.
                         * @example null
                         */
                        options?: Record<string, never> | null;
                        /**
                         * @description What display is used in the admin app to display the value for this field.
                         * @example null
                         */
                        display?: string | null;
                        /**
                         * @description Options for the display that's used. This format is based on the individual display.
                         * @example null
                         */
                        display_options?: Record<string, never> | null;
                        /**
                         * @description If the field can be altered by the end user. Directus system fields have this value set to `true`.
                         * @example true
                         */
                        locked?: boolean;
                        /**
                         * @description Prevents the user from editing the value in the field.
                         * @example false
                         */
                        readonly?: boolean;
                        /**
                         * @description If this field should be hidden.
                         * @example true
                         */
                        hidden?: boolean;
                        /**
                         * @description Sort order of this field on the edit page of the admin app.
                         * @example 1
                         */
                        sort?: number | null;
                        /**
                         * @description Width of the field on the edit form.
                         * @example null
                         * @enum {string|null}
                         */
                        width?: "half" | "half-left" | "half-right" | "full" | "fill" | null;
                        /**
                         * @description What field group this field is part of.
                         * @example null
                         */
                        group?: number | null;
                        /**
                         * @description Key value pair of `<language>: <translation>` that allows the user to change the displayed name of the field in the admin app.
                         * @example null
                         */
                        translation?: Record<string, never> | null;
                        /**
                         * @description A user provided note for the field. Will be rendered alongside the interface on the edit page.
                         * @example
                         */
                        note?: string | null;
                    } | null;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Fields"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getCollectionField: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier of the collection the item resides in. */
                collection: string;
                /** @description Unique identifier of the field. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Fields"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteField: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier of the collection the item resides in. */
                collection: string;
                /** @description Unique identifier of the field. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateField: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier of the collection the item resides in. */
                collection: string;
                /** @description Unique identifier of the field. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Unique name of the field. Field name is unique within the collection.
                     * @example id
                     */
                    field?: string;
                    /**
                     * @description Directus specific data type. Used to cast values in the API.
                     * @example integer
                     */
                    type?: string;
                    /** @description The schema info. */
                    schema?: {
                        /**
                         * @description The name of the field.
                         * @example title
                         */
                        name?: string;
                        /**
                         * @description The collection of the field.
                         * @example posts
                         */
                        table?: string;
                        /**
                         * @description The type of the field.
                         * @example string
                         */
                        type?: string;
                        /**
                         * @description The default value of the field.
                         * @example null
                         */
                        default_value?: string | null;
                        /**
                         * @description The max length of the field.
                         * @example null
                         */
                        max_length?: number | null;
                        /**
                         * @description If the field is nullable.
                         * @example false
                         */
                        is_nullable?: boolean;
                        /**
                         * @description If the field is primary key.
                         * @example false
                         */
                        is_primary_key?: boolean;
                        /**
                         * @description If the field has auto increment.
                         * @example false
                         */
                        has_auto_increment?: boolean;
                        /**
                         * @description Related column from the foreign key constraint.
                         * @example null
                         */
                        foreign_key_column?: string | null;
                        /**
                         * @description Related table from the foreign key constraint.
                         * @example null
                         */
                        foreign_key_table?: string | null;
                        /**
                         * @description Comment as saved in the database.
                         * @example null
                         */
                        comment?: string | null;
                        /**
                         * @description Database schema (pg only).
                         * @example public
                         */
                        schema?: string;
                        /**
                         * @description Related schema from the foreign key constraint (pg only).
                         * @example null
                         */
                        foreign_key_schema?: string | null;
                    };
                    /** @description The meta info. */
                    meta?: {
                        /**
                         * @description Unique identifier for the field in the `directus_fields` collection.
                         * @example 3
                         */
                        id?: number;
                        /**
                         * @description Unique name of the collection this field is in.
                         * @example posts
                         */
                        collection?: string;
                        /**
                         * @description Unique name of the field. Field name is unique within the collection.
                         * @example title
                         */
                        field?: string;
                        /**
                         * @description Transformation flag for field
                         * @example null
                         */
                        special?: string[] | null;
                        /**
                         * @description What interface is used in the admin app to edit the value for this field.
                         * @example primary-key
                         */
                        "system-interface"?: string | null;
                        /**
                         * @description Options for the interface that's used. This format is based on the individual interface.
                         * @example null
                         */
                        options?: Record<string, never> | null;
                        /**
                         * @description What display is used in the admin app to display the value for this field.
                         * @example null
                         */
                        display?: string | null;
                        /**
                         * @description Options for the display that's used. This format is based on the individual display.
                         * @example null
                         */
                        display_options?: Record<string, never> | null;
                        /**
                         * @description If the field can be altered by the end user. Directus system fields have this value set to `true`.
                         * @example true
                         */
                        locked?: boolean;
                        /**
                         * @description Prevents the user from editing the value in the field.
                         * @example false
                         */
                        readonly?: boolean;
                        /**
                         * @description If this field should be hidden.
                         * @example true
                         */
                        hidden?: boolean;
                        /**
                         * @description Sort order of this field on the edit page of the admin app.
                         * @example 1
                         */
                        sort?: number | null;
                        /**
                         * @description Width of the field on the edit form.
                         * @example null
                         * @enum {string|null}
                         */
                        width?: "half" | "half-left" | "half-right" | "full" | "fill" | null;
                        /**
                         * @description What field group this field is part of.
                         * @example null
                         */
                        group?: number | null;
                        /**
                         * @description Key value pair of `<language>: <translation>` that allows the user to change the displayed name of the field in the admin app.
                         * @example null
                         */
                        translation?: Record<string, never> | null;
                        /**
                         * @description A user provided note for the field. Will be rendered alongside the interface on the edit page.
                         * @example
                         */
                        note?: string | null;
                    } | null;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Fields"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getFiles: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Files"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createFile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Files"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteFiles: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateFiles: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: {
                        data?: string;
                    };
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Files"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getFile: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Files"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateFile: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/data": {
                    /**
                     * @description Title for the file. Is extracted from the filename on upload, but can be edited by the user.
                     * @example User Avatar
                     */
                    title?: string;
                    /** @description Preferred filename when file is downloaded. */
                    filename_download?: string;
                    /** @description Description for the file. */
                    description?: string | null;
                    /**
                     * @description Virtual folder where this file resides in.
                     * @example null
                     */
                    folder?: (string | components["schemas"]["Folders"]) | null;
                    /** @description Tags for the file. Is automatically populated based on Exif data for images. */
                    tags?: string[] | null;
                    /**
                     * Format: binary
                     * @description File contents.
                     */
                    file: unknown;
                };
                "application/json": {
                    /**
                     * @description Title for the file. Is extracted from the filename on upload, but can be edited by the user.
                     * @example User Avatar
                     */
                    title?: string;
                    /** @description Preferred filename when file is downloaded. */
                    filename_download?: string;
                    /** @description Description for the file. */
                    description?: string | null;
                    /**
                     * @description Virtual folder where this file resides in.
                     * @example null
                     */
                    folder?: (string | components["schemas"]["Folders"]) | null;
                    /** @description Tags for the file. Is automatically populated based on Exif data for images. */
                    tags?: string[] | null;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Files"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getFolders: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Folders"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createFolder: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Name of the folder.
                     * @example Amsterdam
                     */
                    name: string;
                    /** @description Unique identifier of the parent folder. This allows for nested folders. */
                    parent?: number;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Folders"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteFolders: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateFolders: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: {
                        /**
                         * @description Name of the folder.
                         * @example Amsterdam
                         */
                        name: string;
                        /** @description Unique identifier of the parent folder. This allows for nested folders. */
                        parent?: number;
                    };
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Folders"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getFolder: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Folders"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteFolder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateFolder: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Name of the folder. Can't be null or empty. */
                    name?: string;
                    /**
                     * @description Unique identifier of the parent folder. This allows for nested folders.
                     * @example 3
                     */
                    parent?: number;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Folders"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getActivities: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Activity"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getActivity: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Activity"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getRevisions: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Revisions"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getRevision: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Revisions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getUsers: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createUser: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Users"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteUsers: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateUsers: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: components["schemas"]["Users"];
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getUser: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateUser: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Users"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: Record<string, never>;
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    invite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Email address or array of email addresses of the to-be-invited user(s). */
                    email?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    acceptInvite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /**
                     * @description Accept invite token.
                     * @example eyJh...KmUk
                     */
                    token?: string;
                    /**
                     * Format: password
                     * @description Password of the user.
                     * @example d1r3ctu5
                     */
                    password?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getMe: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Users"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateLastUsedPageMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Path of the page you used last. */
                    last_page?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    meTfaEnable: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    meTfaDisable: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getRelations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Relations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createRelation: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Collection that has the field that holds the foreign key.
                     * @example articles
                     */
                    collection_many?: string;
                    /**
                     * @description Collection on the _one_ side of the relationship.
                     * @example authors
                     */
                    collection_one?: string;
                    /**
                     * @description Foreign key. Field that holds the primary key of the related collection.
                     * @example author
                     */
                    field_many?: string;
                    /**
                     * @description Alias column that serves as the _one_ side of the relationship.
                     * @example books
                     */
                    field_one?: string;
                    /** @description Field on the junction table that holds the primary key of the related collection. */
                    junction_field?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Relations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getRelation: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Relations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteRelation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateRelation: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Collection that has the field that holds the foreign key. */
                    collection_many?: string;
                    /** @description Collection on the _one_ side of the relationship. */
                    collection_one?: string;
                    /** @description Foreign key. Field that holds the primary key of the related collection. */
                    field_many?: string;
                    /**
                     * @description Alias column that serves as the _one_ side of the relationship.
                     * @example books
                     */
                    field_one?: string;
                    /** @description Field on the junction table that holds the primary key of the related collection. */
                    junction_field?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Relations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getPermissions: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Permissions"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createPermission: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description What collection this permission applies to.
                     * @example customers
                     */
                    collection?: string;
                    /**
                     * @description If the user can post comments.
                     * @enum {string}
                     */
                    comment?: "none" | "create" | "update" | "full";
                    /**
                     * @description If the user can create items.
                     * @enum {string}
                     */
                    create?: "none" | "full";
                    /**
                     * @description If the user can update items.
                     * @enum {string}
                     */
                    delete?: "none" | "mine" | "role" | "full";
                    /**
                     * @description If the user is required to leave a comment explaining what was changed.
                     * @enum {string}
                     */
                    explain?: "none" | "create" | "update" | "always";
                    /**
                     * @description If the user can read items.
                     * @enum {string}
                     */
                    read?: "none" | "mine" | "role" | "full";
                    /**
                     * @description Unique identifier of the role this permission applies to.
                     * @example 3
                     */
                    role?: number;
                    /**
                     * @description Explicitly denies read access for specific fields.
                     * @example [
                     *       "featured_image"
                     *     ]
                     */
                    read_field_blacklist?: string[];
                    /** @description What status this permission applies to. */
                    status?: string;
                    /** @description Explicitly denies specific statuses to be used. */
                    status_blacklist?: string[];
                    /**
                     * @description If the user can update items.
                     * @enum {string}
                     */
                    update?: "none" | "mine" | "role" | "full";
                    /** @description Explicitly denies write access for specific fields. */
                    write_field_blacklist?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Permissions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deletePermissions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updatePermissions: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    keys?: string[];
                    data?: {
                        /**
                         * @description What collection this permission applies to.
                         * @example customers
                         */
                        collection?: string;
                        /**
                         * @description If the user can post comments.
                         * @enum {string}
                         */
                        comment?: "none" | "create" | "update" | "full";
                        /**
                         * @description If the user can create items.
                         * @enum {string}
                         */
                        create?: "none" | "full";
                        /**
                         * @description If the user can update items.
                         * @enum {string}
                         */
                        delete?: "none" | "mine" | "role" | "full";
                        /**
                         * @description If the user is required to leave a comment explaining what was changed.
                         * @enum {string}
                         */
                        explain?: "none" | "create" | "update" | "always";
                        /**
                         * @description If the user can read items.
                         * @enum {string}
                         */
                        read?: "none" | "mine" | "role" | "full";
                        /**
                         * @description Unique identifier of the role this permission applies to.
                         * @example 3
                         */
                        role?: number;
                        /**
                         * @description Explicitly denies read access for specific fields.
                         * @example [
                         *       "featured_image"
                         *     ]
                         */
                        read_field_blacklist?: string[];
                        /** @description What status this permission applies to. */
                        status?: string;
                        /** @description Explicitly denies specific statuses to be used. */
                        status_blacklist?: string[];
                        /**
                         * @description If the user can update items.
                         * @enum {string}
                         */
                        update?: "none" | "mine" | "role" | "full";
                        /** @description Explicitly denies write access for specific fields. */
                        write_field_blacklist?: string[];
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Permissions"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getMyPermissions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Permissions"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getPermission: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Permissions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deletePermission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updatePermission: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description What collection this permission applies to. */
                    collection?: Record<string, never>;
                    /**
                     * @description If the user can post comments. `full`.
                     * @enum {string}
                     */
                    comment?: "none" | "create" | "update";
                    /**
                     * @description If the user can create items.
                     * @enum {string}
                     */
                    create?: "none" | "full";
                    /**
                     * @description If the user can update items.
                     * @enum {string}
                     */
                    delete?: "none" | "mine" | "role" | "full";
                    /**
                     * @description If the user is required to leave a comment explaining what was changed.
                     * @enum {string}
                     */
                    explain?: "none" | "create" | "update" | "always";
                    /**
                     * @description If the user can read items.
                     * @enum {string}
                     */
                    read?: "none" | "mine" | "role" | "full";
                    /** @description Explicitly denies read access for specific fields. */
                    read_field_blacklist?: Record<string, never>;
                    /** @description Unique identifier of the role this permission applies to. */
                    role?: Record<string, never>;
                    /** @description What status this permission applies to. */
                    status?: Record<string, never>;
                    /** @description Explicitly denies specific statuses to be used. */
                    status_blacklist?: Record<string, never>;
                    /**
                     * @description If the user can update items.
                     * @enum {string}
                     */
                    update?: "none" | "mine" | "role" | "full";
                    /** @description Explicitly denies write access for specific fields. */
                    write_field_blacklist?: Record<string, never>;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Permissions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getPresets: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Presets"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createPreset: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description What collection this collection preset is used for.
                     * @example articles
                     */
                    collection: string;
                    /**
                     * @description Name for the bookmark. If this is set, the collection preset will be considered to be a bookmark.
                     * @example Highly rated articles
                     */
                    title?: string;
                    /**
                     * @description The unique identifier of a role in the platform. If user is null, this will be used to apply the collection preset or bookmark for all users in the role.
                     * @example null
                     */
                    role?: string;
                    /** @description What the user searched for in search/filter in the header bar. */
                    search?: string;
                    filters?: {
                        /** @example aHKLAakdVghzD */
                        key?: string;
                        /** @example rating */
                        field?: string;
                        /** @example gte */
                        operator?: string;
                        /** @example 4.5 */
                        value?: number;
                    }[];
                    /** @description Name of the view type that is used. */
                    layout?: string;
                    /** @description Layout query that's saved per layout type. Controls what data is fetched on load. These follow the same format as the JS SDK parameters. */
                    layout_query?: string;
                    /** @description Options of the views. The properties in here are controlled by the layout. */
                    layout_options?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Presets"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deletePresets: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updatePresets: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    keys?: string[];
                    data?: {
                        /**
                         * @description What collection this collection preset is used for.
                         * @example articles
                         */
                        collection: string;
                        /**
                         * @description Name for the bookmark. If this is set, the collection preset will be considered to be a bookmark.
                         * @example Highly rated articles
                         */
                        title?: string;
                        /**
                         * @description The unique identifier of a role in the platform. If user is null, this will be used to apply the collection preset or bookmark for all users in the role.
                         * @example null
                         */
                        role?: string;
                        /** @description What the user searched for in search/filter in the header bar. */
                        search?: string;
                        filters?: {
                            /** @example aHKLAakdVghzD */
                            key?: string;
                            /** @example rating */
                            field?: string;
                            /** @example gte */
                            operator?: string;
                            /** @example 4.5 */
                            value?: number;
                        }[];
                        /** @description Name of the view type that is used. */
                        layout?: string;
                        /** @description Layout query that's saved per layout type. Controls what data is fetched on load. These follow the same format as the JS SDK parameters. */
                        layout_query?: string;
                        /** @description Options of the views. The properties in here are controlled by the layout. */
                        layout_options?: string;
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Presets"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getPreset: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Presets"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deletePreset: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updatePreset: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index */
                id: components["parameters"]["Id"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description What collection this collection preset is used for.
                     * @example articles
                     */
                    collection: string;
                    /**
                     * @description Name for the bookmark. If this is set, the collection preset will be considered to be a bookmark.
                     * @example Highly rated articles
                     */
                    title?: string;
                    /** @description The unique identifier of a role in the platform. If user is null, this will be used to apply the collection preset or bookmark for all users in the role. */
                    role?: number;
                    /** @description What the user searched for in search/filter in the header bar. */
                    search_query?: string;
                    filters?: {
                        /** @example rating */
                        field?: string;
                        /** @example gte */
                        operator?: string;
                        /** @example 4.5 */
                        value?: number;
                    }[];
                    /** @description Name of the view type that is used. Defaults to tabular. */
                    view_type?: string;
                    /** @description View query that's saved per view type. Controls what data is fetched on load. These follow the same format as the JS SDK parameters. */
                    view_query?: string;
                    /** @description Options of the views. The properties in here are controlled by the layout. */
                    view_options?: string;
                    /** @description Key value pair of language-translation. Can be used to translate the bookmark title in multiple languages. */
                    translation?: Record<string, never>;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Presets"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getWebhooks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Webhooks"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createWebhook: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description The name of the webhook.
                     * @example create articles
                     */
                    name?: string;
                    /**
                     * @description Method used in the webhook.
                     * @example POST
                     */
                    method?: string;
                    /**
                     * @description The url of the webhook.
                     * @example null
                     */
                    url?: string;
                    /**
                     * @description The status of the webhook.
                     * @example active
                     */
                    status?: string;
                    /**
                     * @description If yes, send the content of what was done
                     * @example true
                     */
                    data?: boolean;
                    /**
                     * @description The actions that triggers this webhook.
                     * @example null
                     */
                    actions?: unknown;
                    /**
                     * @description The collections that triggers this webhook.
                     * @example null
                     */
                    "system-collections"?: unknown;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteWebhooks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateWebhooks: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: {
                        /**
                         * @description The name of the webhook.
                         * @example create articles
                         */
                        name?: string;
                        /**
                         * @description Method used in the webhook.
                         * @example POST
                         */
                        method?: string;
                        /**
                         * @description The url of the webhook.
                         * @example null
                         */
                        url?: string;
                        /**
                         * @description The status of the webhook.
                         * @example active
                         */
                        status?: string;
                        /**
                         * @description If yes, send the content of what was done
                         * @example true
                         */
                        data?: boolean;
                        /**
                         * @description The actions that triggers this webhook.
                         * @example null
                         */
                        actions?: unknown;
                        /**
                         * @description The collections that triggers this webhook.
                         * @example null
                         */
                        "system-collections"?: unknown;
                    };
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Webhooks"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getWebhook: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Webhooks"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteWebhook: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateWebhook: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description The name of the webhook.
                     * @example create articles
                     */
                    name?: string;
                    /**
                     * @description Method used in the webhook.
                     * @example POST
                     */
                    method?: string;
                    /**
                     * @description The url of the webhook.
                     * @example null
                     */
                    url?: string;
                    /**
                     * @description The status of the webhook.
                     * @example active
                     */
                    status?: string;
                    /**
                     * @description If yes, send the content of what was done
                     * @example true
                     */
                    data?: boolean;
                    /**
                     * @description The actions that triggers this webhook.
                     * @example null
                     */
                    actions?: unknown;
                    /**
                     * @description The collections that triggers this webhook.
                     * @example null
                     */
                    "system-collections"?: unknown;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Roles"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getFlows: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Flows"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createFlow: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Flows"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Flows"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteFlows: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateFlows: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: components["schemas"]["Flows"];
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Flows"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getFlow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Flows"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteFlow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateFlow: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Flows"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Flows"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getOperations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Operations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createOperation: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Operations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Operations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteOperations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateOperations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: components["schemas"]["Operations"];
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Operations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getOperation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Operations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteOperation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateOperation: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Operations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Operations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getComments: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Comments"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createComment: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Which collection this collection comment is for.
                     * @example projects
                     */
                    collection: string;
                    /** @example 81dfa7e0-56d2-471f-b96a-1cf8a62bdf28 */
                    item: string;
                    /** @example A new comment */
                    comment: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Comments"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteComments: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateComments: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    keys?: string[];
                    data?: {
                        /**
                         * @description Which collection this collection comment is for.
                         * @example projects
                         */
                        collection: string;
                        /** @example 81dfa7e0-56d2-471f-b96a-1cf8a62bdf28 */
                        item?: string;
                        /** @example A new comment */
                        comment?: string;
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Comments"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getComment: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Comments"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteComment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateComment: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /**
                     * @description Which collection this comment is for.
                     * @example projects
                     */
                    collection: string;
                    /** @example 81dfa7e0-56d2-471f-b96a-1cf8a62bdf28 */
                    item?: string;
                    /** @example An updated comment */
                    comment?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Comments"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getContentVersions: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Versions"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    createContentVersion: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versions"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Versions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteContentVersions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateContentVersions: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    data?: components["schemas"]["Versions"];
                    keys?: string[];
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Versions"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    getContentVersion: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Versions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteContentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateContentVersion: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["Versions"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Versions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    saveContentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    compareContentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: Record<string, never>;
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    promoteContentVersion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Unique identifier for the object. */
                id: components["parameters"]["UUId"];
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Hash of the main version of the item to be promoted. */
                    mainHash?: string;
                    /** @description Optional array of field names of which the values are to be promoted. */
                    fields?: string;
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    listExtensions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Extensions"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateExtensions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                name: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Directus metadata for the extension. Where the configuration for the extension in the current project is stored. */
                    meta?: {
                        /**
                         * @description Whether or not the extension is enabled.
                         * @example true
                         */
                        enabled?: boolean;
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Extensions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateExtensionBundle: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                bundle: string;
                name: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Directus metadata for the extension. Where the configuration for the extension in the current project is stored. */
                    meta?: {
                        /**
                         * @description Whether or not the extension is enabled.
                         * @example true
                         */
                        enabled?: boolean;
                    };
                };
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Extensions"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    getSettings: {
        parameters: {
            query?: {
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Cursor for use in pagination. Often used in combination with limit. */
                page?: components["parameters"]["Page"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Settings"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSetting: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": Record<string, never>;
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["Settings"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsCategories: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategories"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsCategories: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsCategories"][] | components["schemas"]["ItemsCategories"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategories"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsCategories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsCategories: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsCategories"][] | components["schemas"]["ItemsCategories"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategories"][];
                    };
                };
            };
        };
    };
    readSingleItemsCategories: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategories"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsCategories: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsCategories: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsCategories"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategories"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsSiteSettings: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettings"];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsSiteSettings: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsSiteSettings"][] | components["schemas"]["ItemsSiteSettings"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettings"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsSiteSettings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsSiteSettings: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsSiteSettings"][] | components["schemas"]["ItemsSiteSettings"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettings"];
                    };
                };
            };
        };
    };
    readSingleItemsSiteSettings: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettings"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsSiteSettings: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsSiteSettings: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsSiteSettings"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettings"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsAuthors: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthors"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsAuthors: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAuthors"][] | components["schemas"]["ItemsAuthors"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthors"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsAuthors: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsAuthors: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAuthors"][] | components["schemas"]["ItemsAuthors"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthors"][];
                    };
                };
            };
        };
    };
    readSingleItemsAuthors: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthors"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsAuthors: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsAuthors: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAuthors"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthors"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsCategoriesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategoriesTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsCategoriesTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsCategoriesTranslations"][] | components["schemas"]["ItemsCategoriesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategoriesTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsCategoriesTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsCategoriesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsCategoriesTranslations"][] | components["schemas"]["ItemsCategoriesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategoriesTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsCategoriesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategoriesTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsCategoriesTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsCategoriesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsCategoriesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsCategoriesTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsLanguages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsLanguages"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsLanguages: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsLanguages"][] | components["schemas"]["ItemsLanguages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsLanguages"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsLanguages: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsLanguages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsLanguages"][] | components["schemas"]["ItemsLanguages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsLanguages"][];
                    };
                };
            };
        };
    };
    readSingleItemsLanguages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsLanguages"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsLanguages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsLanguages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsLanguages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsLanguages"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsSiteSettingsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettingsTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsSiteSettingsTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsSiteSettingsTranslations"][] | components["schemas"]["ItemsSiteSettingsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettingsTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsSiteSettingsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsSiteSettingsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsSiteSettingsTranslations"][] | components["schemas"]["ItemsSiteSettingsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettingsTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsSiteSettingsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettingsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsSiteSettingsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsSiteSettingsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsSiteSettingsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsSiteSettingsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsAuthorsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthorsTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsAuthorsTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAuthorsTranslations"][] | components["schemas"]["ItemsAuthorsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthorsTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsAuthorsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsAuthorsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAuthorsTranslations"][] | components["schemas"]["ItemsAuthorsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthorsTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsAuthorsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthorsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsAuthorsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsAuthorsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAuthorsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAuthorsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTags"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsTags: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsTags"][] | components["schemas"]["ItemsTags"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTags"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsTags: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsTags"][] | components["schemas"]["ItemsTags"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTags"][];
                    };
                };
            };
        };
    };
    readSingleItemsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTags"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsTags: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsTags"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTags"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsTagsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTagsTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsTagsTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsTagsTranslations"][] | components["schemas"]["ItemsTagsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTagsTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsTagsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsTagsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsTagsTranslations"][] | components["schemas"]["ItemsTagsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTagsTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsTagsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTagsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsTagsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsTagsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsTagsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsTagsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsProjects: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjects"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsProjects: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsProjects"][] | components["schemas"]["ItemsProjects"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjects"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsProjects: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsProjects: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsProjects"][] | components["schemas"]["ItemsProjects"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjects"][];
                    };
                };
            };
        };
    };
    readSingleItemsProjects: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjects"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsProjects: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsProjects: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsProjects"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjects"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsPosts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPosts"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsPosts: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPosts"][] | components["schemas"]["ItemsPosts"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPosts"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsPosts: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsPosts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPosts"][] | components["schemas"]["ItemsPosts"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPosts"][];
                    };
                };
            };
        };
    };
    readSingleItemsPosts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPosts"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsPosts: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsPosts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPosts"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPosts"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsProjectsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjectsTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsProjectsTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsProjectsTranslations"][] | components["schemas"]["ItemsProjectsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjectsTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsProjectsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsProjectsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsProjectsTranslations"][] | components["schemas"]["ItemsProjectsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjectsTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsProjectsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjectsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsProjectsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsProjectsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsProjectsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsProjectsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsPostsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsPostsTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPostsTranslations"][] | components["schemas"]["ItemsPostsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsPostsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsPostsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPostsTranslations"][] | components["schemas"]["ItemsPostsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsPostsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsPostsTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsPostsTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPostsTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsAurPackages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackages"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsAurPackages: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAurPackages"][] | components["schemas"]["ItemsAurPackages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackages"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsAurPackages: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsAurPackages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAurPackages"][] | components["schemas"]["ItemsAurPackages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackages"][];
                    };
                };
            };
        };
    };
    readSingleItemsAurPackages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackages"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsAurPackages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsAurPackages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAurPackages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackages"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsPostsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTags"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsPostsTags: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPostsTags"][] | components["schemas"]["ItemsPostsTags"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTags"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsPostsTags: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsPostsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPostsTags"][] | components["schemas"]["ItemsPostsTags"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTags"][];
                    };
                };
            };
        };
    };
    readSingleItemsPostsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTags"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsPostsTags: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsPostsTags: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPostsTags"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPostsTags"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsAurPackagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackagesTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsAurPackagesTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAurPackagesTranslations"][] | components["schemas"]["ItemsAurPackagesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackagesTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsAurPackagesTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsAurPackagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAurPackagesTranslations"][] | components["schemas"]["ItemsAurPackagesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackagesTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsAurPackagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackagesTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsAurPackagesTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsAurPackagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAurPackagesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAurPackagesTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsPages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPages"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsPages: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPages"][] | components["schemas"]["ItemsPages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPages"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsPages: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsPages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPages"][] | components["schemas"]["ItemsPages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPages"][];
                    };
                };
            };
        };
    };
    readSingleItemsPages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPages"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsPages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsPages: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPages"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPages"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsPagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPagesTranslations"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsPagesTranslations: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPagesTranslations"][] | components["schemas"]["ItemsPagesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPagesTranslations"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsPagesTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsPagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPagesTranslations"][] | components["schemas"]["ItemsPagesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPagesTranslations"][];
                    };
                };
            };
        };
    };
    readSingleItemsPagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPagesTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsPagesTranslations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsPagesTranslations: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsPagesTranslations"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsPagesTranslations"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    readItemsAIPrompts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAIPrompts"][];
                        meta?: components["schemas"]["x-metadata"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    createItemsAIPrompts: {
        parameters: {
            query?: {
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAIPrompts"][] | components["schemas"]["ItemsAIPrompts"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAIPrompts"][];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    deleteItemsAIPrompts: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
        };
    };
    updateItemsAIPrompts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description A limit on the number of objects that are returned. */
                limit?: components["parameters"]["Limit"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description How many items to skip when fetching data. */
                offset?: components["parameters"]["Offset"];
                /** @description How to sort the returned items. `sort` is a CSV of fields used to sort the fetched items. Sorting defaults to ascending (ASC) order but a minus sign (` - `) can be used to reverse this to descending (DESC) order. Fields are prioritized by their order in the CSV. You can also use a ` ? ` to sort randomly. */
                sort?: components["parameters"]["Sort"];
                /** @description Select items in collection by given conditions. */
                filter?: components["parameters"]["Filter"];
                /** @description Filter by items that contain the given search query in one of their fields. */
                search?: components["parameters"]["Search"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAIPrompts"][] | components["schemas"]["ItemsAIPrompts"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAIPrompts"][];
                    };
                };
            };
        };
    };
    readSingleItemsAIPrompts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
                /** @description Retrieve an item's state from a specific Content Version. The value corresponds to the "key" of the Content Version. */
                version?: components["parameters"]["Version"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAIPrompts"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    deleteSingleItemsAIPrompts: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
    updateSingleItemsAIPrompts: {
        parameters: {
            query?: {
                /** @description Control what fields are being returned in the object. */
                fields?: components["parameters"]["Fields"];
                /** @description What metadata to return in the response. */
                meta?: components["parameters"]["Meta"];
            };
            header?: never;
            path: {
                /** @description Index of the item. */
                id: number | string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ItemsAIPrompts"];
            };
        };
        responses: {
            /** @description Successful request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data?: components["schemas"]["ItemsAIPrompts"];
                    };
                };
            };
            401: components["responses"]["UnauthorizedError"];
            404: components["responses"]["NotFoundError"];
        };
    };
}

/* ==========================================================
 * Directus Schema (供 @directus/sdk 泛型使用)
 * ----------------------------------------------------------
 * 下列类型别名由 typegen 基于当前 Directus 实际 schema 生成,
 * 命名规则:Directus 给业务 collection 的 OAS 类型名是 ItemsXxx,
 * 这里重命名为更友好的单数形式,并组装成 Schema interface。
 * ========================================================== */

export type SiteSettings = components["schemas"]["ItemsSiteSettings"];
export type SiteSettingsTranslations = components["schemas"]["ItemsSiteSettingsTranslations"];
export type Authors = components["schemas"]["ItemsAuthors"];
export type AuthorsTranslations = components["schemas"]["ItemsAuthorsTranslations"];
export type Categories = components["schemas"]["ItemsCategories"];
export type CategoriesTranslations = components["schemas"]["ItemsCategoriesTranslations"];
export type Tags = components["schemas"]["ItemsTags"];
export type TagsTranslations = components["schemas"]["ItemsTagsTranslations"];
export type Posts = components["schemas"]["ItemsPosts"];
export type PostsTranslations = components["schemas"]["ItemsPostsTranslations"];
export type PostsTags = components["schemas"]["ItemsPostsTags"];
export type Projects = components["schemas"]["ItemsProjects"];
export type ProjectsTranslations = components["schemas"]["ItemsProjectsTranslations"];
export type AurPackages = components["schemas"]["ItemsAurPackages"];
export type AurPackagesTranslations = components["schemas"]["ItemsAurPackagesTranslations"];
export type Pages = components["schemas"]["ItemsPages"];
export type PagesTranslations = components["schemas"]["ItemsPagesTranslations"];

/** @directus/sdk 泛型参数 */
export interface Schema {
	site_settings: SiteSettings;
	site_settings_translations: SiteSettingsTranslations[];
	authors: Authors[];
	authors_translations: AuthorsTranslations[];
	categories: Categories[];
	categories_translations: CategoriesTranslations[];
	tags: Tags[];
	tags_translations: TagsTranslations[];
	posts: Posts[];
	posts_translations: PostsTranslations[];
	posts_tags: PostsTags[];
	projects: Projects[];
	projects_translations: ProjectsTranslations[];
	aur_packages: AurPackages[];
	aur_packages_translations: AurPackagesTranslations[];
	pages: Pages[];
	pages_translations: PagesTranslations[];
}

/* <<< AUTO-GENERATED-BY-TYPEGEN:END >>> */
