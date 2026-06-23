import { model, Schema } from "mongoose"
import { Blog } from "./blog.entity"


const blogSchema = new Schema(
  {
    name:{type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: String, required: true},
    isMembership: {type: Boolean, required: true, default: false}
  },
  {
    versionKey: false,
  }
)

blogSchema.index({name: 1})

export const BlogModel = model<Blog>('Blogs', blogSchema)

