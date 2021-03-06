<a name="basic-queries"></a>
## Basic Queries

Skygear provides query of records with conditions. Here is a straight-forward
example of getting the note that has the `title` as `First note` inside the
public database. If you don't know the difference between
privateDB and publicDB, please read [Records](/js/guide/record) section first.

``` javascript
const Note = skygear.Record.extend('note');
const query = new skygear.Query(Note);
query.equalTo('title', 'First note');
skygear.publicDB.query(query).then((notes) => {
  // notes is an array of Note records that has its "title" equals "First note"
}, (error) => {
  console.error(error);
});
```

You can make queries on [reserved columns](/js/guide/record#reserved) as well,
and of course you can put multiple conditions in the same query object:

``` javascript
const query = new skygear.Query(Note);
query.lessThan('order', 10);
query.equalTo('category', 'diary');
skygear.publicDB.query(query);
```

By default, the condition added to the query are combined with `AND`. To
construct an `OR` query, we need to specify it with the following syntax.

``` javascript
const likeQuery = new skygear.Query(Note);
likeQuery.greaterThan('like', 50);
const shareQuery = new skygear.Query(Note);
shareQuery.greaterThan('share', 10);
const query = skygear.Query.or(likeQuery, shareQuery);
query.equalTo('category', 'diary');
skygear.publicDB.query(query);
// SQL equivalent: (like > 50 OR share > 10) AND category = 'diary'
```

You can use `skygear.Query.not(query)` to get a condition negated version of `query`.

<a name="conditions"></a>
## Conditions

Conditions are like `WHERE` clause in SQL query and `filter` in NoSQL query.
Here is a list of simple conditions you can apply on a query:

``` javascript
query.equalTo('title', 'First note');
query.notEqualTo('category', 'dangerous');
query.lessThan('age', 10);
query.lessThanOrEqualTo('age', 10);
query.greaterThan('size', 50);
query.greaterThanOrEqualTo('size', 50);
```

### Contains condition

The `contains` condition can be used to query a key for value that matches one
of the items in a specified array. Suppose here we are querying for movies,
and each movie has exactly one genre.

``` javascript
query.contains('genre', ['science-fiction', 'adventure']);
query.notContains('genre', ['romance', 'horror']);
```

If the value is an array, the `containsValue` condition can be used to query for
a key that has an array as its value containing the specified value. Suppose
further that each movie has multiple tags as an array, for example
_Independence Day: Resurgence_ may have tags "extraterrestrial" and "war".

``` javascript
query.containsValue('tags', 'war');
query.notContainsValue('tags', 'hollywood');
// both matches our example movie
```

### Like condition

The `like` function can be used to query a key for complete or partial matches
of a specified string. The percent character (`%`) can be used in place
for any number of characters while the underscore (`_`) can be used in place
for a single character.

``` javascript
query.like('genre', 'science%'); // included: science, science-fiction, etc.
query.notLike('state', 'C_');    // excluded: CA, CO, CT, etc.
query.caseInsensitiveLike('month', '%a%');    // included: January, April, etc.
query.caseInsensitiveNotLike('actor', '%k%'); // excluded: Katy, Jack, etc.
```

### Having relation condition

The `havingRelation` condition can be used to query records whose owner or
creator has relationship with the current user. For example, you can use it
to query new posts made by users whom you are following.

``` javascript
query.havingRelation('_owner', skygear.relation.Following);
query.notHavingRelation('_owner', skygear.relation.Friend);
// records owned by following users but not friend users
```

See [Social](/js/guide/relation) section for more about relations.

### Geolocation condition

Please visit [Geo-location](/js/guide/geolocation) section for more.

<a name="pagination-ordering"></a>
## Pagination and Ordering

### Ordering of records

You can sort the records based on certain field in ascending or descending order.
You can also sort on multiple fields as well.

``` javascript
query.addAscending('age');    // sorted by age increasing order
query.addDescending('price'); // sorted by price decreasing order
```

The above query will first sort from small age to large age, and records
with the same age will be then sorted from high price to low price. Just like
this SQL statement: `ORDER BY age, price DESC`.

### Pagination of records

There are 3 settings that affect query pagination:
- `limit`: number of records per query/page (default value 50)
- `page`: which page of records to return (skip `page - 1` pages of records)
- `offset`: number of records to skip

You shall not set both `page` and `offset`, otherwise `page` will be ignored.

``` javascript
query.page = 3;
/* 101st to 150th records */
```

``` javascript
query.limit = 20;
query.offset = 140;
/* 141st to 160th records */
```

``` javascript
query.limit = 15;
query.page = 8;
/* 106th to 120th records */
```

### Counting the records

To get the number of records matching a query, set the `overallCount`
of the Query to `true`.

``` javascript
query.overallCount = true;
skygear.publicDB.query(query).then((notes, count) => {
  console.log('%d records matching query.', count);
}, (error) => {
  console.error(error);
});
```

The count is not affected by the limit set on the query. So, if you only want
to get the count without fetching any records, simply set `query.limit = 0`.

<a name="relational-queries"></a>
## Relational Queries

### Eager Loading

If you have a record that with [reference](/js/guide/record#reference) to
another record, you can perform eager loading using the transient syntax.
(Note: it is possible to eager load records from multiple keys, but doing so
will impair performance)

Given the following setting (notice that Delivery has reference to Address
on key `destination`):

``` javascript
const Delivery = skygear.Record.extend('delivery');
const Address = skygear.Record.extend('address');

const address = new Address({ /* some key-value pairs */ });
const delivery = new Delivery({ destination: new skygear.Reference(address) });
skygear.publicDB.save([address, delivery]);
```

Now if you want to query delivery together with the address:

``` javascript
const query = new skygear.Query(Delivery);
query.transientInclude('destination');
skygear.publicDB.query(query).then((records) => {
  console.log(records[0].destination);            // skygear.Reference object
  console.log(records[0].$transient.destination); // Address record object
}, (error) => {
  console.error(error);
});
```

You can also set an alias for transient-included field.

``` javascript
const query = new skygear.Query(Delivery);
query.transientInclude('destination', 'deliveryAddress');
skygear.publicDB.query(query).then((records) => {
  console.log(records[0].$transient.deliveryAddress); // Address record object
}, (error) => {
  console.log(error);
});
```

<a name="cached-query"></a>
## Cached Query

Skygear provides a simple cached query mechanism for application that wants to
display the data last seen before it gets new data from Skygear Server. To make
use of this, you just need to provide an extra callback function to the `query`
function, and Skygear will try to return an cached result before it gets the
latest result from the Skygear server.

``` javascript
const query = new skygear.Query(Note);
query.equalTo('title', 'First note');
function successCallback(notes, cached = false) {
  if (cached) {
    console.log('The result is a cached one');
  }
  console.log('Result', notes);
}
skygear.publicDB.query(query, successCallback)
.then(successCallback, (error) => {
  console.error(error);
});
```

- It is not guaranteed that the callback is called before a request takes
  place, especially if a cached result of the query is not available.
  In other words, if the result is not in the cache, the callback is only
  called once, after the requested result is returned from the server.
- It is guaranteed once the callback from server is called, cached callback will
  not get called.
- You may use one callback to handle both cached callback and server
  callback as above. But you are free to use two callbacks if it works
  better in your use cases.

<a name="subscription"></a>
## Subscribe to Query Change (**Coming Soon**)

### Creating a subscription

The following code creates a subscription of all the `Note` created by
`skygear.currentUser`. Notice that creating a subscription does not involve
the use of the `new` keyword.

```javascript
const Note = skygear.Record.extend('note');
const query = new skygear.Query(Note);
query.equalTo('_created_by', skygear.currentUser.id);

subscription = skygear.Subscription('my notes');
subscription.query = query;
skygear.publicDB.saveSubscription(subscription);
```

### Fetching subscription

```javascript
skygear.publicDB.fetchSubscription('my notes').then((subscription) => {
  // examine the subscription here
}, (error) => {
  console.error('error fetching "my notes": %o', error);
});
```

### Fetching all subscriptions

```javascript
skygear.publicDB.fetchAllSubscriptions().then((subscriptions) => {
  subscriptions.forEach((subscription) => {
    // do something with the subscription here
  });
}, (error) => {
  console.error('error fetching all subscriptions: %o', error);
});
```

### Deleting a subscription

```javascript
skygear.publicDB.deleteSubscription('my notes').then((subscription) => {
  console.log('success deleting "my notes"')
}, (error) => {
  console.error('error deleting "my notes": %o', error)
});
```

### Listening to subscription notification

Once user subscribes, we can listen to subscription notifications.

```javascript
const listener = skygear.addNotificationListener((notification) => {
  if (notification.subscriptionID === 'my notes') {
    let id = notification.recordID;
    switch (notification.reason) {
      case skygear.NOTIFICATION_REASON_DELETED:
        // some note is deleted
        break;
      case skygear.NOTIFICATION_REASON_CREATED:
        // a new note is created
        break;
      case skygear.NOTIFICATION_REASON_UPDATED:
        // some note is updated with changes
        const changes = notification.recordChanges;
        // do something with the changes
        break;
    }
  }
});

// later in the program when done listening
listener.off();
```
