# Motion Token Use

This rule is intended enforce use of Carbon theme tokens, functions, mixins and CSS classes as defined.

- [https://www.carbondesignsystem.com/guidelines/motion/overview](https://www.carbondesignsystem.com/guidelines/motion/overview)

By default it accepts undefined SCSS and CSS variables.

NOTE: Transition and animation shorthand must conform to expected order

## Default props

```js
const defaultOptions = {
  // include standard motion properties
  includeProps: [
    "transition<2>", // only permitted definition order fails otherwise
    "transition-duration",
    "animation<2>", // only permitted definition order fails otherwise
    "animation-duration",
  ],
  //  Accept reset values
  acceptValues: ["0s", "0"],
  acceptsScopes: ["motion"],
  acceptUndefinedVariables: false,
  carbonPath: undefined // allows a different path for node_modules (supports monorepo with multiple carbon versions) e.g. packages/proj1/node_modules/@carbon
  carbonModulePostfix: undefined, // optional for use in conjunction with `carbonPath` to where a Carbon module has been renamed e.g. `-10` with a carbonPath of `node_modules/@carbon` will use `node_modules/@carbon/motion-10`
  enforceScopes: false,
};
```

## Fix

The automatic fixes for the motion-duration rule are as follows.

- V11: Replace `$carbon--` with `$`
- V11: Replace `$duration--` with `$duration-`
- Replace timing literal match `$duration-0y` or `$duration--0y` token depending on version.
