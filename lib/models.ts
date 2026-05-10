import mongoose from 'mongoose';

const FormSchema = new mongoose.Schema({
  formType: { type: String, required: true },
  submittedBy: { type: String, required: true }, // The Labourer's username
  data: { type: Object, required: true },        // YES/NO answers
  attachment: { type: String, default: null },   // Base64 Image string
  managerRemarks: { type: String, default: "" }, // Manager's feedback
  status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' },
  inspectionDate: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['labourer', 'manager', 'admin'], default: 'labourer' },
});

export const Form = mongoose.models.Form || mongoose.model('Form', FormSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);