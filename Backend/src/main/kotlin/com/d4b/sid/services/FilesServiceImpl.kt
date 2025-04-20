package com.d4b.sid.services

import com.d4b.sid.dao.FilesDao
import com.d4b.sid.exeption.SidOperationException
import com.d4b.sid.model.db.File
import com.sun.source.doctree.DocTree
import org.apache.tomcat.util.http.fileupload.FileUploadException
import org.digidoc4j.Configuration
import org.digidoc4j.ContainerBuilder
import org.digidoc4j.DataFile
import org.springframework.beans.factory.annotation.Value
import org.springframework.mock.web.MockMultipartFile
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.*

@Service
class FilesServiceImpl(
    private val filesDao: FilesDao
): FilesService {

    @Value("\${project.directory.path}")
    private val projectDirectoryPath: String? = null

    @Value("\${app.signed-files-directory}")
    private val signedFilesDirectory: String? = null

    override fun saveFile(file: MultipartFile, uploadedBy: String): File {
        return filesDao.uploadFile(
            fileName = file.originalFilename ?: "unknown",
            fileContent = file.bytes,
            uploadedBy = uploadedBy
        )
    }

    override fun overwriteFile(file: MultipartFile, fileId: Long): File {
        return filesDao.overwriteFileContent(fileId, file.bytes)
    }

    override fun addFilesToGroup(fileIds: List<Long>, groupId: Int, userId: String) {
        fileIds.forEach { fileId ->
            filesDao.addExistingFileToGroup(fileId, groupId, userId)
        }
    }

    override fun signFile(fileId: Long, signingUserId: String) {
        filesDao.signFile(fileId, signingUserId)
    }

    override fun createContainer(fileId: Long, requestingUserId: String, groupId: Int): File {

        //TODO: for bulk signing accept list of fileIds
        val file = filesDao.getFile(fileId, requestingUserId)

        val configuration = Configuration(Configuration.Mode.TEST)

        configuration.lotlLocation = "https://open-eid.github.io/test-TL/tl-mp-test-EE.xml"
        configuration.lotlTruststorePath =
            "$projectDirectoryPath/Backend/src/main/kotlin/com/d4b/sid/services/tlskeystore.jks"
        configuration.lotlTruststorePassword = "smartsign";
        configuration.lotlTruststoreType = "JKS";

        val containerBuilder = ContainerBuilder.aContainer().withConfiguration(configuration)

        val uploadedFiles = getMultipartFiles(listOf(file)).map {
            getUploadedDataFile(it)
        }

        for (f in uploadedFiles) {
            containerBuilder.withDataFile(f)
        }

        val container = containerBuilder.build()

        val containerFile = java.io.File.createTempFile("${file.name.split(".")[0]}-sid-container", ".asice")
        val targetPath = createSavePath(containerFile)

        val tempFile = container!!.saveAsFile(targetPath.toString())

        val multipartFile = MockMultipartFile(
            tempFile.name,
            tempFile.name,
            Files.probeContentType(tempFile.toPath()),
            Files.readAllBytes(tempFile.toPath())
        )

        val savedContainer = saveFile(multipartFile, requestingUserId)

        if (tempFile.delete()) {
            println("File deleted successfully: ${tempFile.absolutePath}")
        } else {
            println("Failed to delete the file: ${tempFile.absolutePath}")
        }

        addFilesToGroup(listOf(savedContainer.id), groupId, requestingUserId)
        return savedContainer
    }

    private fun getUploadedDataFile(uploadedFile: MultipartFile?): DataFile {
        try {
            return DataFile(uploadedFile!!.inputStream, uploadedFile.originalFilename, uploadedFile.contentType)
        } catch (e: IOException) {
            throw FileUploadException(e.cause.toString())
        }
    }

    private fun getMultipartFiles(files: List<File>): List<MultipartFile> {
        return files.map { file ->
            val decodedBytes = Base64.getDecoder().decode(file.fileContent)
            val fileName = file.name
            val fileExtension = fileName.substringAfterLast('.', "")
            val contentType = when (fileExtension.lowercase()) {
                "pdf" -> "application/pdf"
                "txt" -> "text/plain"
                "jpg", "jpeg" -> "image/jpeg"
                "png" -> "image/png"
                "gif" -> "image/gif"
                "zip" -> "application/zip"
                "html" -> "text/html"
                "csv" -> "text/csv"
                else -> "application/octet-stream"
            }

            MockMultipartFile(fileName, fileName, contentType, decodedBytes)
        }
    }

    private fun createSavePath(containerFile: java.io.File): Path? {
        val targetDir = signedFilesDirectory?.let { Paths.get(it) }
        val directory = targetDir?.toFile()
        if (directory != null) {
            if (!directory.exists()) {
                directory.mkdirs()
            }
        }
        if (targetDir != null) {
            return targetDir.resolve(containerFile.name)
        }
        return null
    }
}