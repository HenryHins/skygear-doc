This section describes the database schema used by Skygear.

Tables in the database can be classified into Records Table and Reserved Table.
Names of reserved tables are always prefixed with underscore (`_`).

## Records Table

For each record type stored in the database, a table with the same name as the record type is created. For example, if your record type is called `note`, there is a table called `note` in the database. Each row in the table corresponds to one record.

For each record table there exists two types of columns, those that are reserved by Skyear and those that are user-defined. Reserved columns contain metadata of a record, such as record ID, record owner and creation time. Names of reserved columns are prefixed with underscore (`_`).

It is possible to manipulate data in record tables directly. However, one should exercise cautions when modifying data directly in record tables.

Each record table contains the following reserved columns:

* `_id` (string) This column contains the unique identifier of the record. This is usually referred to as the Record ID.
* `_database_id` (string) This column contains identifier of the record database that this record is saved into. If this column is empty, the record is saved into the public database. Otherwise, it is saved into the private database with that identifier. Note: Although the private database identifier is currently the same as the User ID, this is an implementation and may subject to change.
* `_owner_id` (string) This column contains the unique identifier of the user who owns the record.
* `_access` (json) This column contains access control definition of the record.
* `_created_at` (datetime) This column contains the time the record was created.
* `_created_by` (string) This column contains the identifier of the user who created the record.
* `_updated_at` (datetime) This column contains the time the record was last updated.
* `_updated_by` (string) This column contains the identifier of the user who made the most recent change to the record.

User-defined columns contain data that are set by your app. The type of a user-defined column is determined at the time when that column is first written. During development mode, the schema of the record table is migrated as new columns are found in the record.

For example, consider a `note` record with the following JSON representation:

```
{
    "_id": "note/abcdef",
    "_database_id": "_public"
    "content": "Hello World",
    "noteOrder": 1
}
```

The above record will be saved in a record table called `note` with the following schema:

* _id (string): "abcdef"
* _database_id (string): null
* _owner_id (string): "CURRENT_USER"
* _access (json): null
* content (string): "Hello World"
* noteOrder (integer): 1

## Reserved Tables

Reserved tables stores data that is not a record. For example, user data and device data are not stored in a record table but a reserved table. The schemas of the reserved tables are fixed in each Skygear version, but you may need to migrate the schema of these tables when upgrading from an old version of Skygear Server to a new version. Do not manually change the schema of the reserved tables.

It is possible to manipulate the data in the reserved tables directly, but this is not advised since doing so may damage the data consistency. Exercise cautions when modifying data in reserved tables.

Below is a list of the reserved tables.

### User

The `_user` reserved table stores data of each user in Skygear. This is the most important reserved table as the majority part of the system depends on user data.

### Device

The `_device` reserved table stores data of each device, which is usually associated with a user account. The table also stores push notification registration information of the device.

### Subscription

The `_subscription` reserved table stores data of each subscription, which contains query for detecting changes in the record database.

### Follow

The `_follow` reserved table contains follow-type user relations.

### Friend

The `_friend` reserved table contains friend-type user relations.

### Asset

The `_asset` reserved table contains metadata of user-uploaded assets. The contents of the assets are not stored in the database.
