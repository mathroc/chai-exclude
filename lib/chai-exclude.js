module.exports = (chai, utils) => {
  const Assertion = chai.Assertion

  /**
   * Remove keys from an object and return a new object.
   *
   * @param   {Object}  obj       object to remove keys
   * @param   {Array}   props     array of keys to remove
   * @param   {Boolean} recursive true if property needs to be removed recursively
   * @returns {Object}
   */
  function removeKeysFromObject (obj, props, recursive = false) {
    const res = {}
    const keys = Object.keys(obj)
    const isRecursive = !!recursive

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const val = obj[key]

      const hasKey = props.indexOf(key) === -1

      if (isRecursive && hasKey && isObject(val)) {
        res[key] = removeKeysFromObject(val, props, true)
      } else if (isRecursive && hasKey && isArray(val)) {
        res[key] = removeKeysFromArray(val, props, true)
      } else if (hasKey) {
        res[key] = val
      }
    }

    return res
  }

  /**
   * Remove keys from an object inside an array and return a new array.
   *
   * @param   {Array}   array     array with objects
   * @param   {Array}   props     array of keys to remove
   * @param   {Boolean} recursive true if property needs to be removed recursively
   * @returns {Array}
   */
  function removeKeysFromArray (array, props, recursive = false) {
    const res = []
    let val = {}

    if (!array.length) {
      return res
    }

    for (let i = 0; i < array.length; i++) {
      if (isObject(array[i])) {
        val = removeKeysFromObject(array[i], props, true)
      } else if (isArray(array[i])) {
        val = removeKeysFromArray(array[i], props, true)
      } else {
        val = array[i]
      }

      res.push(val)
    }

    return res
  }

  /**
   * Check if the argument is an array.
   *
   * @param   {any}  arg
   * @returns {Boolean}
   */
  function isArray (arg) {
    return Array.isArray(arg)
  }

  /**
   * Check if the argument is an object.
   *
   * @param   {any}      arg
   * @returns {Boolean}
   */
  function isObject (arg) {
    return arg instanceof Object && arg.constructor === Object
  }

  /**
   * Override standard assertEqual method to remove the keys from other part of the equation.
   *
   * @param   {Object}    _super
   * @returns {Function}
   */
  function assertEqual (_super) {
    return function (val) {
      if (utils.type(val).toLowerCase() === 'object') {
        if (utils.flag(this, 'excluding')) {
          val = removeKeysFromObject(val, utils.flag(this, 'excludingProps'))
        } else if (utils.flag(this, 'excludingEvery')) {
          val = removeKeysFromObject(val, utils.flag(this, 'excludingProps'), true)
        }
      }

      _super.apply(this, arguments)
    }
  }

  /**
   * Add a new method 'excluding' to the assertion library.
   */
  Assertion.addMethod('excluding', function (props) {
    utils.expectTypes(this, ['object'])

    const obj = this._obj

    // If exclude parameter is not provided
    if (!props) {
      return this
    }

    if (typeof props === 'string') {
      props = [props]
    }

    this._obj = removeKeysFromObject(obj, props)

    utils.flag(this, 'excluding', true)
    utils.flag(this, 'excludingProps', props)

    return this
  })

  /**
   * Add a new method 'excludingEvery' to the assertion library.
   */
  Assertion.addMethod('excludingEvery', function (props) {
    utils.expectTypes(this, ['object'])

    const obj = this._obj

    // If exclude parameter is not provided
    if (!props) {
      return this
    }

    if (typeof props === 'string') {
      props = [props]
    }

    this._obj = removeKeysFromObject(obj, props, true)

    utils.flag(this, 'excludingEvery', true)
    utils.flag(this, 'excludingProps', props)

    return this
  })

  Assertion.overwriteMethod('eq', assertEqual)
  Assertion.overwriteMethod('equal', assertEqual)
  Assertion.overwriteMethod('equals', assertEqual)
}
