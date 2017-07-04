beforeEach(() => {
  global.console = {
    log: global.console.log.bind(console),
    warn: jest.fn(),
    error: jest.fn(),
  }
})
