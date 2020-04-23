"use strict";

var _ = require("../");

describe("parseOptions", function () {
  var defaults = {
    includeProps: ["1", "3", "4"],
    ignoreValues: ["1", "5", "6"]
  };
  var options1 = undefined;
  it("Uses default options when options undefined", function () {
    expect((0, _.parseOptions)(options1, defaults)).toEqual(defaults);
  });
  var options2 = {};
  it("Uses default options when options {}", function () {
    expect((0, _.parseOptions)(options2, defaults)).toEqual(defaults);
  });
  var options3 = {
    includeProps: []
  };
  it("Uses default options when options without ignoreValues", function () {
    expect((0, _.parseOptions)(options3, defaults)).toEqual(defaults);
  });
  var options4 = {
    ignoreValues: []
  };
  it("Uses default options when options without includeProps", function () {
    expect((0, _.parseOptions)(options4, defaults)).toEqual(defaults);
  });
  var options5 = {
    includeProps: ["*"],
    ignoreValues: ["*"]
  };
  it("Uses default options when using * only", function () {
    expect((0, _.parseOptions)(options5, defaults)).toEqual(defaults);
  });
  var options6 = {
    includeProps: ["*", "banana"],
    ignoreValues: ["fish", "*"]
  };
  var combinedOpts1 = {
    includeProps: ["banana"].concat(defaults.includeProps),
    ignoreValues: ["fish"].concat(defaults.ignoreValues)
  };
  it("Adds default options when using *", function () {
    expect((0, _.parseOptions)(options6, defaults)).toEqual(combinedOpts1);
  });
  var options7 = {
    includeProps: ["*", "cake", "2", "3"],
    ignoreValues: ["eagle", "*", "5", "7"]
  };
  var combinedOpts2 = {
    includeProps: ["cake", "2", "3"].concat(defaults.includeProps.filter(function (item) {
      return item !== "3";
    })),
    ignoreValues: ["eagle", "5", "7"].concat(defaults.ignoreValues.filter(function (item) {
      return item !== "5";
    }))
  };
  it("Combines default options when using *", function () {
    expect((0, _.parseOptions)(options7, defaults)).toEqual(combinedOpts2);
  });
});