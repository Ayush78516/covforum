import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(200).json({ 
        success: true, 
        message: "Message received successfully.", 
        data: contact 
    });
    } catch (err) { 
        return res.status(500).json({ success: false, message: err.message }); 
    };
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) { 
    return res.status(500).json({ success: false, message: err.message }); 
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ 
        success: false, 
        message: "Message not found." 
    });
    res.json({ 
        success: true, 
        message: "Message deleted.", 
        data: contact 
    });
  } catch (err) { 
    return res.status(500).json({ success: false, message: err.message }); 
  };
};
