class StateManager {
  constructor() {
    this.state = {};
    this.subscribers = {};
    this.history = [];
    this.batchUpdate = false;
    this.pendingUpdates = {};
  }

  init(initialState) {
    this.state = { ...initialState };
    this.history.push({ action: 'init', state: { ...this.state } });
  }

  get(key) {
    return this.state[key];
  }

  getAll() {
    return { ...this.state };
  }

  set(key, value) {
    if (typeof key === 'object') {
      Object.keys(key).forEach(k => this._setState(k, key[k]));
    } else {
      this._setState(key, value);
    }

    if (!this.batchUpdate) {
      this._notifySubscribers();
    }
  }

  _setState(key, value) {
    if (this.state[key] !== value) {
      this.history.push({
        action: 'update',
        key,
        oldValue: this.state[key],
        newValue: value,
        timestamp: Date.now()
      });

      if (this.history.length > 100) {
        this.history.shift();
      }

      this.state[key] = value;

      if (this.batchUpdate) {
        this.pendingUpdates[key] = value;
      }
    }
  }

  batch(callback) {
    this.batchUpdate = true;
    try {
      callback();
    } finally {
      this.batchUpdate = false;
      if (Object.keys(this.pendingUpdates).length > 0) {
        this._notifySubscribers();
        this.pendingUpdates = {};
      }
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }

    const subscriber = { callback };
    this.subscribers[key].push(subscriber);

    return () => {
      this.subscribers[key] = this.subscribers[key].filter(s => s !== subscriber);
    };
  }

  _notifySubscribers() {
    Object.keys(this.state).forEach(key => {
      if (this.subscribers[key]) {
        this.subscribers[key].forEach(subscriber => {
          try {
            subscriber.callback(this.state[key]);
          } catch (error) {
            console.error(`状态订阅者回调失败 [${key}]:`, error);
          }
        });
      }
    });
  }

  clear(key) {
    if (key) {
      delete this.state[key];
      if (this.subscribers[key]) {
        this.subscribers[key].forEach(subscriber => {
          try {
            subscriber.callback(undefined);
          } catch (error) {
            console.error(`状态订阅者回调失败 [${key}]:`, error);
          }
        });
      }
    } else {
      this.state = {};
      this._notifySubscribers();
    }
  }

  reset(newState) {
    this.state = { ...newState };
    this.history.push({ action: 'reset', state: { ...this.state } });
    this._notifySubscribers();
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  exportState() {
    return { ...this.state };
  }

  importState(state) {
    this.state = { ...state };
    this.history.push({ action: 'import', state: { ...this.state } });
    this._notifySubscribers();
  }
}

let stateManagerInstance = null;

const getStateManager = () => {
  if (!stateManagerInstance) {
    stateManagerInstance = new StateManager();
  }
  return stateManagerInstance;
};

module.exports = {
  StateManager,
  getStateManager
};
