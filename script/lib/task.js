const {EventEmitter} = require("events");

module.exports = class Task {
  constructor(name) {
    this.name = name;
    this.emitter = new EventEmitter();
  }

  skip() {
    return false;
  }

  run() {
    throw new Error("Tasks must implement `run` method");
  }

  finish() {
    this.emitter.emit("finish", {reason: "DONE"});
  }

  onFinished(callback) {
    this.emitter.addListener("finish", callback);
  }

  finishedPromise() {
    return new Promise(resolve => this.emitter.addListener("finish", resolve));
  }

  getName() {
    return this.name;
  }

  start(...args) {
    const skip = this.skip();
    if (skip) {
      if (typeof skip === "string") {
        console.log(`-> Skipping ${this.getName()}: ${skip}`);
      }
      return;
    }
    console.log(`-> ${this.getName()}`);
    return this.run(...args);
  }

  subtask(msg) {
    console.log(`    -> ${msg}`);
  }

  info(msg) {
    console.info(`    - ${msg}`)
  }

  warn(msg) {
    console.warn(`    - ! ${msg}`)
  }

  error(msg) {
    console.error(`    - !! ${msg}`)
  }
}
