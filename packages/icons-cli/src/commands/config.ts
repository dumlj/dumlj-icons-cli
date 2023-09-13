import { program } from 'commander'
import configAction from '../actions/config'

/** 生成svg命令
 *  dumlj-icons -c <config files path>
 */
program
  .name('@dumlj/icons-cli')
  .description('A script that automatically generates svg icons components')
  .option('-c, --config <file>', 'the config file path')
  .action(configAction)
