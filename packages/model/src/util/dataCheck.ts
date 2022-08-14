import { assert, Struct, StructError } from 'superstruct';
import { isPlainObject } from './lodash';
export type BaseDataCheckParameters = {
  data: any;
  message?: string;
  throwError?: boolean;
};
export type DataCheckFunc = (parameters: BaseDataCheckParameters) => {
  isValidate: boolean;
  message?: string;
  throwError?: boolean;
  error?: any;
};

export const checkFuncWrap = (func: DataCheckFunc): DataCheckFunc => {
  return ({ data, message, throwError }) => {
    const validateRes = func({ data, message, throwError });
    if (validateRes.isValidate) {
      return validateRes;
    } else {
      if (throwError) {
        if (validateRes.message || message) {
          throw new Error(
            `${validateRes.message || message}\n originData: ${JSON.stringify(
              data
            )}`
          );
        } else {
          throw new Error(
            `${JSON.stringify(data)} \n data struct format is invalidate`
          );
        }
      } else {
        return validateRes;
      }
    }
  };
};

export const checkString = checkFuncWrap((data) => {
  if (data && typeof data === 'string') {
    return {
      isValidate: true,
    };
  } else {
    return {
      isValidate: false,
    };
  }
});

export const checkNumber = checkFuncWrap((data) => {
  if (data && typeof data === 'number') {
    return {
      isValidate: true,
    };
  } else {
    return {
      isValidate: false,
    };
  }
});

export const checkIsObject = checkFuncWrap((data) => {
  if (isPlainObject(data)) {
    return {
      isValidate: true,
    };
  } else {
    return {
      isValidate: false,
    };
  }
});

export const checkComplexData = (parameters: {
  data: any;
  dataStruct: Struct<any, any>;
  message?: string;
  throwError?: boolean;
}) => {
  const { data, message, throwError, dataStruct } = parameters;
  const newFunc = checkFuncWrap(({ data: innerData }) => {
    try {
      assert(innerData, dataStruct);
      return {
        isValidate: true,
      };
    } catch (e: any) {
      let message = e;

      if (e instanceof StructError) {
        const failures = e.failures();

        message = failures.map((failure) => {
          return `【${failure.path.join('.')}】: ${failure.message}\n`;
        });
      }
      return {
        isValidate: false,
        message: message,
        error: e,
      };
    }
  });
  return newFunc({ data, message, throwError });
};
