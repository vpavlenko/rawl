/**
 * Open a handle to an existing file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
 */
export function getFileHandle() {
  return window.showOpenFilePicker().then((handles) => handles[0])
}

/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
 */
export function getNewFileHandle() {
  const opts = {
    types: [
      {
        description: "Text file",
        accept: { "text/plain": [".txt"] },
      },
    ],
  }
  return window.showSaveFilePicker(opts)
}

/**
 * Reads the raw text from a file.
 *
 * @param {File} file
 * @return {!Promise<string>} A promise that resolves to the parsed string.
 */
export function readFile(file: File) {
  // If the new .text() reader is available, use it.
  if (file.text) {
    return file.text()
  }
  // Otherwise use the traditional file reading technique.
  return _readFileLegacy(file)
}

/**
 * Reads the raw text from a file.
 *
 * @private
 * @param {File} file
 * @return {Promise<string>} A promise that resolves to the parsed string.
 */
function _readFileLegacy(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener("loadend", (e) => {
      const text = reader.result as string
      resolve(text)
    })
    reader.readAsText(file)
  })
}

declare global {
  interface FileSystemFileHandle {
    createWriter(): Promise<FileSystemWritableFileStream>
  }

  interface FileSystemWritableFileStream {}
}

/**
 * Writes the contents to disk.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to write to.
 * @param {string} contents Contents to write.
 */
export async function writeFile(
  fileHandle: FileSystemFileHandle,
  contents: string
) {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable()
  // Write the contents of the file to the stream.
  await writable.write(contents)
  // Close the file and write the contents to disk.
  await writable.close()
}

/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to check.
 * @param {boolean} withWrite True if write permission should be checked.
 * @return {boolean} True if the user has granted read/write permission.
 */
export async function verifyPermission(
  fileHandle: FileSystemFileHandle,
  withWrite: boolean
) {
  const opts: FileSystemHandlePermissionDescriptor = {}
  if (withWrite) {
    opts.mode = "readwrite"
  }
  // Check if we already have permission, if so, return true.
  if ((await fileHandle.queryPermission(opts)) === "granted") {
    return true
  }
  // Request permission to the file, if the user grants permission, return true.
  if ((await fileHandle.requestPermission(opts)) === "granted") {
    return true
  }
  // The user did nt grant permission, return false.
  return false
}
