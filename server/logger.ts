import chalk from "chalk";

export const info = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(chalk.green(`${timestamp} - [INFO] [server]: ${message}`));
}

export const error = (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const errorMessage = error ? `: ${error}` : "";
    console.log(chalk.red(`${timestamp} - [ERROR] [server]: ${message}${errorMessage}`));
}

export const warn = (message: string) => {
    const timestamp = new Date().toISOString();
    console.log(chalk.yellow(`${timestamp} - [WARN] [server]: ${message}`));
}

export default {
    info,
    error,
    warn
}