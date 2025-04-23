module.exports = {
  src_folders: ['tests/nightwatch'],
  globals_path: 'tests/setup.js',
  
  webdriver: {
    start_process: true,
    server_path: require('chromedriver').path,
    port: 9515
  },
  
  test_settings: {
    default: {
      launch_url: 'http://localhost:8080',
      screenshots: {
        enabled: true,
        path: 'tests/screenshots',
        on_failure: true
      },
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--headless', '--no-sandbox']
        }
      }
    },
    
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    
    firefox: {
      webdriver: {
        server_path: require('geckodriver').path,
        port: 4444
      },
      desiredCapabilities: {
        browserName: 'firefox',
        alwaysMatch: {
          'moz:firefoxOptions': {
            args: ['--headless']
          }
        }
      }
    }
  }
};