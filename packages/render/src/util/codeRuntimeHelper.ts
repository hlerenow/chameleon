export const generateObjVarProxy = (
  varName: string,
  options: {
    keyListVar: string;
    getReadValCode: string;
  } = {
    keyListVar: 'ALL_NODE_IDS',
    getReadValCode: '',
  }
) => {
  let tempVarName = varName;
  // id 以数字开头, 自动添加下划线
  if (tempVarName[0] === String(Number(tempVarName[0]))) {
    tempVarName = `_${tempVarName}`;
  }

  return `
var ${varName} = {};

${options.keyListVar}.forEach(function (key) {
  var tempK = /^\\d/.test(key) ? ('_' + key) : key;
  Object.defineProperty(${varName}, tempK, {
    get: function () {
      ${options.getReadValCode}
    },
    set: function (value) {},
    enumerable: true
  });
});
`;
};
