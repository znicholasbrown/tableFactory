

function Table(element, data, sortField, dataLabelsMap, idField, callback, options, editCallback) {
  'use strict'
  this.options = options || {};
  this.data = _.sortBy(data, sortField);
  this.totalRows = 0;
  var $table, $thead, $theadrow, $tbody;

  this.createTable = () => {
    $table = $("<table/>").attr({ id: element + "_table", class: "centered" });
    $thead = $('<thead/>').appendTo($table);
    $theadrow = $('<tr/>').appendTo($thead);
    $tbody = $('<tbody/>').appendTo($table);

    _.each(dataLabelsMap, (value, key, list) => {
      $('<th/>').text(value).appendTo($theadrow);
    });

    _.each(this.data, (element, index, list) => {
      let $trow = this.createRow(element);

      if ($trow) $trow.appendTo($tbody)
    });
    $table.appendTo(element);
  }

  this.createRow = (obj) => {
    if (this.filterRow(obj)) {
      this.totalRows += 1;
      let $brow = $('<tr/>').attr({ id: "table_row_" + (this.options.idFieldExtra ? this.options.idFieldExtra + "_" : "") + obj[idField] });

      _.each(dataLabelsMap, (value, key, list) => {
        $('<td/>').text(obj[key]).appendTo($brow);

        if (this.aggregate && this.aggregateMap.hasOwnProperty(key)) {

          if (Array.isArray(this.aggregateMap[key])) { // If an array is passed into the map at a certain key, it will be treated as a series of count comparisons, i.e. if a value is present in that array, it will ++ the count
            this.aggregates[key] += this.aggregateMap[key].indexOf(obj[key]) < 0 ? 0 : 1;

          }

          if (this.aggregateMap[key] == 'sum') this.aggregates[key] += obj[key];

          if (this.aggregateMap[key] == 'average') {
            this.aggregates[key].count += 1;
            this.aggregates[key].total += obj[key];
            this.aggregates[key].average = this.aggregates[key].total / this.aggregates[key].count;
          }

        }

      });
      $brow.on("click", () => {
        callback(obj);
      })

      return $brow;
    }
  }

  this.addAggregateMap = (aggregateMap) => {
    this.aggregate = true;
    this.aggregateMap = aggregateMap;
    this.aggregates = _.mapObject(aggregateMap, (val, key) => {
      if (Array.isArray(val)) return 0;

      if (val == 'sum') return 0;

      if (val == 'average') return {
        count: 0,
        total: 0,
        average: 0
      };
    });

    this.updateTable();
  }

  this.resetAggregates = () => {
    this.aggregates = _.mapObject(this.aggregateMap, (val, key) => {
      if (Array.isArray(val)) return 0;

      if (val == 'sum') return 0;

      if (val == 'average') return {
        count: 0,
        total: 0,
        average: 0
      };
    });
  }

  this.precisionRound = (number, precision) => { //Adapted from MDN
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  }

  this.createAggregateRow = () => {

      var $arow = $('<tr/>').attr({ id: "table_aggregate_row_" + (this.options.idFieldExtra ? this.options.idFieldExtra + "_" : "") });

      _.each(dataLabelsMap, (value, key, list) => {

        if (this.aggregates[key]) {
          return typeof this.aggregates[key] == 'object' ? $('<td/>').text(this.precisionRound(this.aggregates[key].average, 2)).appendTo($arow) : $('<td/>').text(this.precisionRound(this.aggregates[key], 0).toLocaleString()).appendTo($arow)
        } else {
          return $('<td/>').appendTo($arow);
        }


      });

      return $arow;
  }

  this.updateFilter = (filter, value) => {
    if (this.options.filtersOver.hasOwnProperty(filter)) {

      this.options.filtersOver[filter] = value;

    } else if (this.options.filtersUnder.hasOwnProperty(filter)) {

      this.options.filtersUnder[filter] = value;

    }

    this.updateTable(this.data);
  }

  this.filterRow = (obj) => {
    let keep = true;
    for (var filter in this.options.filtersOver) {
      if (obj[filter] < this.options.filtersOver[filter]) {
        keep = false;
      }
    }
    for (var filter in this.options.filtersUnder) {
      if (obj[filter] > this.options.filtersUnder[filter]) {
        keep = false;
      }
    }
    return keep;
  }

  this.updateTable = (data) => {
    this.data = _.sortBy(data, sortField);
    this.totalRows = 0;
    $tbody.html('');

    this.aggregate ? this.resetAggregates() : '';

    _.each(this.data, (element, index, list) => {
      let $trow = this.createRow(element, index);

      if ($trow) $trow.appendTo($tbody);
    });

    this.aggregate ? this.createAggregateRow().appendTo($tbody) : '';
  }

  this.destroy = () => {
    this.data = undefined;
    $tbody.html('');
  }
}
