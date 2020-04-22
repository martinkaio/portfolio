const fs = require("fs");
const util = require("util");

// async/await with fs.readFile
const readFile = util.promisify(fs.readFile);

/**
 * Logic for fetching projects information
 */
class ProjectService {
  /**
   * @param {*} datafile Path to a JSON file that contains the projects data
   */
  constructor(datafile) {
    this.datafile = datafile;
  }

  // Returns a list of projects names
  async getNames() {
    const data = await this.getData();

    // map() to transform the array into another one
    return data.map((projects) => {
      return { name: projects.name };
    });
  }

  // Get all pictures
  async getAllPictures() {
    const data = await this.getData();

    // Array.reduce() to traverse all projects and
    // create an array that contains all pictures
    const pictures = data.reduce((acc, el) => {
      if (el.pictures) {
        // eslint-disable-next-line no-param-reassign
        acc = [...acc, ...el.pictures];
      }
      return acc;
    }, []);
    return pictures;
  }

  /**
   * Get all pictures of a given project
   * @param {*} name The projects name
   */
  async getPictureForProject(name) {
    const data = await this.getData();
    const projects = data.find((el) => {
      return el.name === name;
    });
    if (!projects || !projects.pictures) return null;
    return projects.pictures;
  }

  /**
   * Get project information provided a name
   * @param {*} name
   */
  async getProject(name) {
    const data = await this.getData();
    const projects = data.find((el) => {
      return el.name === name;
    });
    if (!projects) return null;
    return {
      title: projects.title,
      name: projects.name,
      summary: projects.summary,
    };
  }

  // Returns a list of projects with only the basic information
  async getListShort() {
    const data = await this.getData();
    return data.map((projects) => {
      return {
        name: projects.name,
        title: projects.title,
      };
    });
  }

  // Get a list of projects
  async getList() {
    const data = await this.getData();
    return data.map((projects) => {
      return {
        name: projects.name,
        title: projects.title,
        summary: projects.summary,
      };
    });
  }

  // Fetches projects data from the JSON file provided to the constructor
  async getData() {
    const data = await readFile(this.datafile, "utf8");
    return JSON.parse(data).projects;
  }
}

module.exports = ProjectService;
