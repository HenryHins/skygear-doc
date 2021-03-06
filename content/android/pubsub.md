Skygear provides pubsub services for building apps required real-time updates.
A typical pubsub services can be devided into two parts: Publish and
Subscription.

<a name="publish"></a>
## Publish

The following code snippet shows how to publish a data object (in `JSON` foramt)
to a specific channel:

```java
Pubsub pubsub = Container.defaultContainer(this).getPubsub();

JSONObject jsonObject = new JSONObject();
jsonObject.put("msg", "Hello World");

pubsub.publish("chatroom-001", jsonObject);
```

<a name="subscribe"></a>
## Subscribe

You may need to subscribe to a channel, so that you will be notified if there
are updates:

```java
Pubsub pubsub = Container.defaultContainer(this).getPubsub();
pubsub.subscribe("chatroom-001", new Pubsub.Handler() {
    @Override
    public void handle(JSONObject data) {
        String msg = data.getString("msg");
        messageList.add(msg);  // Your own logic to handle the incoming message
    }
});

```

By default, the handler you provide will be dispatched to main thread. If you
want your handler to run in the background, you can update the pubsub settings:

```java
Pubsub pubsub = Container.defaultContainer(this).getPubsub();
pubsub.setHandlerExecutionInBackground(true);

```

<a name="unsubscribe"></a>
## Unsubscribe

You may also need to unsubscribe to a channel if you don't need the notification
from that channel:

```java
Pubsub pubsub = Container.defaultContainer(this).getPubsub();

// you may need the return value for unsubscription
Pubsub.Handler handler = pubsub.subscribe("chatroom-001", new Pubsub.Handler() {
    // Pubsub.Handler implementation ...
});

pubsub.unsubscribe("chatroom-001", handler);

```

Of cause, you can add multiple handlers and unsubscribe all of them:

```java
Pubsub pubsub = Container.defaultContainer(this).getPubsub();

pubsub.subscribe("chatroom-001", new Pubsub.Handler() {
    // Pubsub.Handler implementation A ...
});

pubsub.subscribe("chatroom-001", new Pubsub.Handler() {
    // Pubsub.Handler implementation B ...
});

pubsub.subscribe("chatroom-001", new Pubsub.Handler() {
    // Pubsub.Handler implementation C ...
});

pubsub.unsubscribeAll("chatroom-001");

```