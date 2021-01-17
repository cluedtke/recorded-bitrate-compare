class Stopwatch {
  seconds = 0;
  minutes = 0;
  hours = 0;
  t;

  constructor(element) {
    this.element = element;
  }

  start = () => {
    this.element.textContent = "00:00:00";
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    this.tick();
  };

  tick = () => {
    this.t = setTimeout(this.add, 1000);
  };

  add = () => {
    this.seconds++;
    if (this.seconds >= 60) {
      this.seconds = 0;
      this.minutes++;
      if (this.minutes >= 60) {
        this.minutes = 0;
        this.hours++;
      }
    }
    this.element.textContent =
      (this.hours ? (this.hours > 9 ? this.hours : "0" + this.hours) : "00") +
      ":" +
      (this.minutes
        ? this.minutes > 9
          ? this.minutes
          : "0" + this.minutes
        : "00") +
      ":" +
      (this.seconds > 9 ? this.seconds : "0" + this.seconds);

    this.tick();
  };

  stop = () => {
    clearTimeout(this.t);
  };
}
