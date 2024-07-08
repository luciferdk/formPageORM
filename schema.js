// schema.js
module.exports = {
    your_table: {
      id: {
        type: 'SERIAL',
        primary: true
      },
      name: {
        type: 'VARCHAR(100)'
      },
      age: {
        type: 'INTEGER'
      }
    }
  };
  