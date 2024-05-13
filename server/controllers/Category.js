const Category = require("../models/Category");

//create tag
exports.createCategory = async (req, res) => {
    try {

        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        const tagDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(tagDetails);

        return res.status(200).json({
            success: true,
            message: "Tag created successfully",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//get all tags
exports.showAllCategories = async (req, res) => {
    try {
        const allTags = await Category.find({}, { name: true, description: true });
        return res.status(200).json({
            success: true,
            message: "All tags return successfully",
            allTags,
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}


exports.categoryPageDetails = async (req, res) => {
    try {

        const { categoryId } = req.body;

        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        if(!selectedCategory){
           
            return res.status(404).json({
                success: false,
                message: "data not found for selected catefory",
            })
        }

        const differentCategory = await Category.find({_id:{$ne:categoryId}}).populate("courses").exec();

        return res.status(200).json({
            success: true,
            message: "category page details fetch successfully",
            data:{
                selectedCategory,
                differentCategory,
            }
        })


    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success: false,
            message: "error while fetching catrgory page details",
        })

    }
}