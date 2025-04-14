import mongoose from "mongoose";

const searchPostsSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true, 
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
searchPostsSchema.index({ content: "text" }); 
searchPostsSchema.index({ createdAt: -1 });
const Search = mongoose.model("Search", searchPostsSchema); 

export default Search; 
