# expense-tracker

## Docker
To use docker, first you must [install docker](https://docs.docker.com/engine/install/)

Since this project is using docker in ubuntu, I would recommend using it after configuring WSL on Windows

- [Windows Subsystem for Linux (WSL) installation](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers)
- [Docker Desktop MacOS](https://docs.docker.com/desktop/setup/install/mac-install/)

After that is done, I also recommend using the tool 'Make', which should now be easier to use with WSL installed. IDK what you wanna do for Macs for this, however [stack overflow](https://stackoverflow.com/questions/10265742/how-to-install-make-and-gcc-on-a-mac) tends to be helpful. 

After make is installed, all you need to do is run these two commands in the home directory for the repository. 

```sh
make build
```

and then 

```sh
make run
```

And that will run it locally at localhost ([here](127.0.0.1:80))

To stop it from running, run `make kill` in the repository directory. 
