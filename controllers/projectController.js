const catchAsync = require("../utils/catchAsync");
const project = require("../db/models/project"); // make sure this path is correct
const user = require("../db/models/user");

const createProject = catchAsync(async (req, res, next) => {

  const body = req.body;
  const userId=req.user.id;

  // create a new project using fields from req.body
  const newProject = await project.create({

    title: body.title,
    productImage: body.productImage,
    price: body.price,
    shortDescription: body.shortDescription,
    description: body.description,
    productUrl: body.productUrl,
    category: body.category,
    tags: body.tags,
    createdBy: userId,            // user id who created it
    // createdAt and updatedAt are filled automatically
  });

  res.status(201).json({
    status: "success",
    data: {
      project: newProject
    }
  });
});


const getAllProject = catchAsync(async (req, res, next) => {
  const result = await project.findAll({include:user});

  return res.status(200).json({
    status: 'success',
    results: result.length,
    data: {
      projects: result
    }
  });
});
const getProjectById = catchAsync(async (req, res, next) => {
  const projectId = req.params.id; // ✅ get the id from URL

  const result = await project.findByPk(projectId, { include: user }); // use findByPk

  if (!result) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  return res.status(200).json({
    status: 'success',
    data: {
      project: result
    }
  });
});

// Update project
const updateProject = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  const body = req.body;

  const projectToUpdate = await project.findByPk(projectId);

  if (!projectToUpdate) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  if (projectToUpdate.createdBy !== userId && req.user.userType !== '0') {
    return res.status(403).json({
      status: 'fail',
      message: "You don't have permission to update this project"
    });
  }

  await projectToUpdate.update(body);

  const updatedProject = await project.findByPk(projectId, { include: user });

  res.status(200).json({
    status: 'success',
    data: {
      project: updatedProject
    }
  });
});

// Delete project
const deleteProject = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const projectId = req.params.id;

  const projectToDelete = await project.findByPk(projectId);

  if (!projectToDelete) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  if (projectToDelete.createdBy !== userId && req.user.userType !== '0') {
    return res.status(403).json({
      status: 'fail',
      message: "You don't have permission to delete this project"
    });
  }

  await projectToDelete.destroy();

res.status(200).json({
  status: 'success',
  message: 'Project deleted successfully'
});
});

module.exports = {
  createProject,
  getAllProject,
  getProjectById,
  updateProject,
  deleteProject
};