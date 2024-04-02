# Type Token Use

This rule is intended enfoce use of Carbon type tokens, functions, mixins and CSS classes as defined.
[https://www.carbondesignsystem.com/guidelines/typography/overview/](https://www.carbondesignsystem.com/guidelines/typography/overview/)

Often Carbon fonts are set through the use of mixins, which this linter does not check for.

Carbon recommends using the mixin approach which is why these functions are optional.

## Default props

```js
const defaultOptions = {
  // include standard type properties
  includeProps: ["font", "/^font-*/", "line-height", "letterSpacing"],
  acceptValues: ["/inherit|initial/"],
  acceptsScopes: ["type"],
  acceptCarbonFontWeightFunction: false, // permit use of carbon font weight function
  acceptCarbonTypeScaleFunction: false, // permit use of carbon type scale function
  acceptCarbonFontFamilyFunction: false, // permit use of carbon font family function
  carbonPath: undefined // allows a different path for node_modules (supports monorepo with multiple carbon versions),
   e.g. packages/proj1/node_modules/@carbon
  carbonModulePostfix: undefined, // optional for use in conjunction with `carbonPath` to where a Carbon module has been renamed e.g. `-10` with a carbonPath of `node_modules/@carbon` will use `node_modules/@carbon/type-10`
  enforceScopes: false
};
```

## Fix

The automatic fixes for the type rule are as follows.

- V11: Remove `carbon--` prefix from function names with e.g. `carbon--font-width`;
