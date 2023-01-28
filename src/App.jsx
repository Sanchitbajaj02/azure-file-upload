import { useState } from "react";

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileEncode from "filepond-plugin-file-encode";

import {
  BlobClient,
  BlobServiceClient,
  ContainerClient,
} from "@azure/storage-blob";

// import {
//   BlobServiceClient,
//   StorageSharedKeyCredential,
// } from "@azure/storage-blob";

// Import FilePond styles
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileEncode
);

function App() {
  const [file, setFile] = useState([]);
  const [inputFile, setInputFile] = useState(null);

  console.log(file);

  async function uploadFile() {
    // NOTE: upload file to azure blob storage using filepond
    try {
      let storageAccount = "tcviewstorage";
      let sasToken =
        "?sv=2021-06-08&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-01-31T14:55:22Z&st=2023-01-02T06:55:22Z&spr=https,http&sig=l62uQA5pStCpml4Hs%2F5m6A%2FgoFZEOVVIJuNdXeo0B9w%3D";

      const blobService = new BlobServiceClient(
        `https://${storageAccount}.blob.core.windows.net/${sasToken}`
      );

      // NOTE: enter the container name to connect
      const containerClient = blobService.getContainerClient("images");

      // NOTE: this will create the container if it does not exist
      await containerClient.createIfNotExists({
        access: "container",
      });

      const blobClient = containerClient.getBlockBlobClient("company-logo.png");
      console.log(blobClient);

      const options = {
        blobHTTPHeaders: {
          blobContentType: file[0].file.type,
        },
      };

      // console.log(file);

      blobClient
        .uploadBrowserData(file[0].file, options)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <FilePond
        checkValidity={true}
        allowFileTypeValidation={true}
        allowFileEncode={true}
        imagePreviewMaxFileSize={"500KB"}
        acceptedFileTypes={["image/png", "image/jpeg", "image/jpg"]}
        files={file}
        onupdatefiles={setFile}
        allowMultiple={false}
        maxFiles={1}
        name="pdf"
        oninit={() => console.log("FilePond instance has initialised")}
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />

      <input
        type="file"
        multiple={true}
        onChange={(e) => {
          console.log(e.target.files);
          setInputFile(e.target.files);
        }}
      />

      <button onClick={uploadFile}>Upload</button>
    </div>
  );
}

export default App;
