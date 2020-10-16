import arraySlice from "./arraySlice.js";
import Check from "./Check.js";
import defined from "./defined.js";
import Resource from "./Resource.js";
import RuntimeError from "./RuntimeError.js";
import KTX2Transcoder from "../Scene/KTX2Transcoder.js";
import when from "../ThirdParty/when.js";

/**
 * Stores the supported formats that KTX2 can transcode to. Called during context creation.
 *
 * @param {Boolean} etc1 Whether or not ETC1 is supported
 * @param {Boolean} s3tc Whether or not S3TC is supported
 * @param {Boolean} pvrtc Whether or not PVRTC is supported
 * @private
 * */
var supportedTranscoderFormats;

loadKTX2.setKTX2SupportedFormats = function (etc1, s3tc, pvrtc) {
  supportedTranscoderFormats = {
    etc1: etc1,
    s3tc: s3tc,
    pvrtc: pvrtc,
  };
};

/**
 * Asynchronously loads and parses the given URL to a KTX2 file or parses the raw binary data of a KTX2 file.
 * Returns a promise that will resolve to an object containing the image buffer, width, height and format once loaded,
 * or reject if the URL failed to load or failed to parse the data.  The data is loaded
 * using XMLHttpRequest, which means that in order to make requests to another origin,
 * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
 * <p>
 * The following are part of the KTX2 format specification but are not supported:
 * <ul>
 *     <li>Metadata</li>
 *     <li>3D textures</li>
 *     <li>Texture Arrays</li>
 *     <li>Video</li>
 *     <li>Compressed Mipmaps</li>
 * </ul>
 * </p>
 *
 * @exports loadKTX2
 *
 * @param {Resource|String|ArrayBuffer} resourceOrUrlOrBuffer The URL of the binary data or an ArrayBuffer.
 * @returns {Promise.<CompressedTextureBuffer>|undefined} A promise that will resolve to the requested data when loaded. Returns undefined if <code>request.throttle</code> is true and the request does not have high enough priority.
 *
 * @exception {RuntimeError} Invalid KTX2 file.
 * @exception {RuntimeError} File is the wrong endianness.
 * @exception {RuntimeError} glInternalFormat is not a valid format.
 * @exception {RuntimeError} glType must be zero when the texture is compressed.
 * @exception {RuntimeError} The type size for compressed textures must be 1.
 * @exception {RuntimeError} glFormat must be zero when the texture is compressed.
 * @exception {RuntimeError} Generating mipmaps for a compressed texture is unsupported.
 * @exception {RuntimeError} The base internal format must be the same as the format for uncompressed textures.
 * @exception {RuntimeError} 3D textures are not supported.
 * @exception {RuntimeError} Texture arrays are not supported.
 * @exception {RuntimeError} Cubemaps are not supported.
 *
 * @example
 * // load a single URL asynchronously
 * Cesium.loadKTX2('some/url').then(function(ktx2Data) {
 *     var width = ktx2Data.width;
 *     var height = ktx2Data.height;
 *     var format = ktx2Data.internalFormat;
 *     var arrayBufferView = ktx2Data.bufferView;
 *     // use the data to create a texture
 * }).otherwise(function(error) {
 *     // an error occurred
 * });
 *
 * @see {@link hhttp://github.khronos.org/KTX-Specification/|KTX file format}
 * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
 * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
 * @private
 */
function loadKTX2(resourceOrUrlOrBuffer) {
  //>>includeStart('debug', pragmas.debug);
  Check.defined("resourceOrUrlOrBuffer", resourceOrUrlOrBuffer);
  //>>includeEnd('debug');

  var loadPromise;
  if (
    resourceOrUrlOrBuffer instanceof ArrayBuffer ||
    ArrayBuffer.isView(resourceOrUrlOrBuffer)
  ) {
    loadPromise = when.resolve(resourceOrUrlOrBuffer);
  } else {
    var resource = Resource.createIfNeeded(resourceOrUrlOrBuffer);
    loadPromise = resource.fetchArrayBuffer();
  }

  if (!defined(loadPromise)) {
    return undefined;
  }

  // load module then return
  return loadPromise.then(function (data) {
    if (defined(data)) {
      // data array can be a view of a shared buffer,
      // so make a copy that can be given to the worker.
      var copy = arraySlice(data);
      return KTX2Transcoder.transcode(copy, supportedTranscoderFormats);
    }
    return when.reject(new RuntimeError("failed to load KTX2 data."));
  });
}

export default loadKTX2;
