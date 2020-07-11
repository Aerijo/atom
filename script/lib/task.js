module.exports = class Task {
  constructor(name) {
    this.indent = "";
    this.name = name;
  }

  skip() {
    return false;
  }

  run() {
    throw new Error("Tasks must implement `run` method");
  }

  getName() {
    return this.name;
  }

  start(...args) {
    const skip = this.skip(...args);
    if (skip) {
      if (typeof skip === "string") {
        console.log(this.indent + `-> Skipping ${this.getName()}: ${skip}`);
      }
      return Promise.resolve();
    }
    console.log(this.indent + `-> ${this.getName()}`);
    return this.run(...args);
  }

  child(task, ...args) {
    task.indent = this.indent + "    ";
    return task.start(...args);
  }

  subtask(msg) {
    console.log(this.indent + `  -> ${msg}`);
  }

  info(msg) {
    console.info(this.indent + `  - ${msg}`)
  }

  warn(msg) {
    console.warn(this.indent + `  - ! ${msg}`)
  }

  error(msg) {
    console.error(this.indent + `  - !! ${msg}`)
  }
}
