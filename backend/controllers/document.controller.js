// controllers/document.controller.js
// LEARNING NOTE:
// multer is a Node.js middleware for handling file uploads.
// When a file is uploaded, multer saves it to disk and adds
// req.file with: filename, path, size, mimetype, originalname
//
// We store the FILE PATH in the database, not the file itself.
// Files live in: backend/uploads/

const path = require('path')
const fs   = require('fs')
const { Document, Customer } = require('../models')

// GET /api/documents/customer/:customerId
const getByCustomer = async (req, res) => {
  try {
    const docs = await Document.findAll({
      where: { customerId: req.params.customerId },
      order: [['createdAt', 'DESC']],
    })
    res.json(docs)
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

// POST /api/documents/upload
// req.file is populated by multer middleware (configured in routes)
const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' })
    }

    const { customerId, policyId, docType } = req.body

    if (!customerId || !docType) {
      // Clean up the uploaded file if validation fails
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ message: 'customerId and docType are required.' })
    }

    const document = await Document.create({
      customerId,
      policyId:  policyId || null,
      docType,
      fileName:  req.file.originalname,
      filePath:  req.file.path,           // relative path: uploads/filename
      fileSize:  req.file.size,
      mimeType:  req.file.mimetype,
    })

    res.status(201).json(document)
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document.', error: error.message })
  }
}

// GET /api/documents/:id/download
const download = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found.' })

    // Check if file exists on disk
    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ message: 'File not found on server.' })
    }

    // Send file to browser for download
    res.download(doc.filePath, doc.fileName)
  } catch (error) {
    res.status(500).json({ message: 'Error downloading.', error: error.message })
  }
}

// DELETE /api/documents/:id
const remove = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found.' })

    // Delete file from disk first
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath)
    }

    // Then delete record from database
    await doc.destroy()
    res.json({ message: 'Document deleted.' })
  } catch (error) {
    res.status(500).json({ message: 'Error.', error: error.message })
  }
}

module.exports = { getByCustomer, upload, download, remove }
