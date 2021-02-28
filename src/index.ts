import * as _ from 'lodash';
import * as deepUpdate from 'deep-update';

export = combinedReduction;

module combinedReduction {
  export type Action = {type:string};
  export type Reducer = (state:{}, action:Action) => {};
  export type ReducerMap = {[key:string]:Reducer|ReducerMap};
  export type ReducerOrMap = Reducer | ReducerMap;
}

type _DispatchPair = [string[], combinedReduction.Reducer];

/**
 * Combines **both** keyed reducers and top level reducers in any order.
 *
 * top level reducers are passed directly, and keyed reducers are passed as a
 * mapping of mount points to reducers.
 */
function combinedReduction(...reducers:(combinedReduction.ReducerOrMap)[]):combinedReduction.Reducer {
  const dispatchPairs:_DispatchPair[] = _.reduce(reducers, (m, r) => m.concat(_findReducers(r)), []);

  return (state:{}, action:combinedReduction.Action) => {
    for (let [path, reducer] of dispatchPairs) {
      let currentState = path.length === 0 ? state : _.get(state, path);
      let newState:{};
      try {
        newState = reducer(currentState, action);
      } catch (error) {
        console.error(`Error in reducer mounted at ${path.join('.')}:`, error);
        continue;
      }
      if (currentState === newState) continue;

      state = deepUpdate(state, path, {$set: newState});
    }

    return state;
  };
}

/**
 * Expands `reducer` into pairs for easy dispatching.
 */
function _findReducers(reducer:combinedReduction.ReducerOrMap, basePath:string[] = []):_DispatchPair[] {
  if (!reducer) return []; // blank entries are ok.
  if (_.isFunction(reducer)) {
    // The easy case, we just have a reducer function to be immediately mounted:
    return [[basePath, reducer]];
  }
  if (!_.isPlainObject(reducer)) {
    throw new TypeError(`Cannot combine reducer of type ${typeof reducer} at ${basePath.join('.')}`);
  }

  return _.reduce(<combinedReduction.ReducerMap>reducer, (result, config, key) => {
    return result.concat(_findReducers(config, basePath.concat(key)));
  }, []);
}
