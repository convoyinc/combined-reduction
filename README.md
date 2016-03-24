# combined-reduction

Like Redux's [`combineReducers`](http://redux.js.org/docs/api/combineReducers.html), but more better!


## Nested Reducers

Everyone loves a little hierarchy!  Place your reducers at any depth in the store:

```
const reducer = combinedReduction({
  session: session.reducer,
  entities: {
    users: users.reducer,
  },
});
```


## Top Level Reducers

Now, you _could_ use [`compose`](http://redux.js.org/docs/api/compose.html) to chain together multiple top level reducers, but what's the fun in that?

How about declaring all your reducers in one handy place:

```
const reducer = combinedReduction(
  migrations.reducer,
  {
    session: session.reducer,
    entities: {
      users: users.reducer,
    },
  },
);
```

Top level reducers are passed directly as arguments, and are processed in order.
