import { join } from "path";

export default {
  dataFetchInterval: parseInt(process.env.DATA_FETCH_INTERVAl) || 3000,
  // __dirname is <project-root>/dist folder
  flowserRootDir: join(__dirname, '..', '.flowser')
}
