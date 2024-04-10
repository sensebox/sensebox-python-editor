import { Button, Code, Container, Flex, VStack } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { GoTrash } from "react-icons/go";
import { RiTerminalLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { topBarHeight } from "../deployment/misc";
import { DeviceContextProvider, useDevice } from "../device/device-hooks";

interface ReplProps {
  shown: boolean;
  onReplHide: () => void;
  showReplButtonRef: React.RefObject<HTMLButtonElement>;
  minWidth: number;
}

const ReplWindow = ({
  shown,
  onReplHide,
  showReplButtonRef,
  minWidth,
}: ReplProps) => {
  const intl = useIntl();
  const device = useDevice();
  const [serialPortContent, setSerialPortContent] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [port, setPort] = useState<SerialPort | undefined>(undefined);
  const [reader, setReader] = useState<
    ReadableStreamDefaultReader<any> | undefined
  >(undefined);

  const handleConnect = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setPort(port);
      setSerialPortContent([]);

      if (port.readable) {
        const reader = port.readable.getReader();
        setReader(reader);

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }
          if (value) {
            //   byte array to string: https://stackoverflow.com/a/37542820
            const text = new TextDecoder().decode(value);
            setSerialPortContent((prevContent) => [...prevContent, text]);
            contentRef.current?.scrollTo({
              top: contentRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error reading from serial port:", error);
    }
  };

  const handleDisconnect = async () => {
    if (port && reader) {
      await reader.cancel();
      await port.close();
      setPort(undefined);
    }
  };

  return (
    <DeviceContextProvider value={device}>
      <Flex
        flex="1 1 100%"
        flexDirection="column"
        height="100%"
        position="relative"
      >
        <Flex
          position="absolute"
          top={0}
          left={0}
          alignItems="center"
          height={topBarHeight}
        >
          <HideSplitViewButton
            aria-label={"Hide simulator"}
            onClick={onReplHide}
            splitViewShown={shown}
            direction="expandLeft"
          />
        </Flex>
        <VStack bg="gray.25" height={"100%"} gap={0}>
          <Container variant="sidebar-header" background={"white"}>
            <Flex
              boxShadow="0px 4px 16px #00000033"
              height={topBarHeight}
              alignItems="center"
              justifyContent="center"
              pl={8}
              gap={4}
              zIndex={123}
            >
              <Button
                onClick={!port ? handleConnect : handleDisconnect}
                leftIcon={<RiTerminalLine />}
              >
                {!port ? "Connect" : "Disconnect"}
              </Button>
            </Flex>
          </Container>
          <Code
            width="100%"
            height="100%"
            overflowY={"scroll"}
            pb={10}
            pt={5}
            px={5}
            maxW="md"
            minW={minWidth}
            ref={contentRef}
            flex={1}
            background={"transparent"}
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {serialPortContent.map((log, i) => {
              return (
                <span
                  key={i}
                  style={{
                    display: "block",
                  }}
                >
                  {log}
                </span>
              );
            })}
          </Code>
          <Flex
            px={5}
            py={6}
            width={"100%"}
            alignItems={"center"}
            justifyContent={"end"}
            background={"white"}
          >
            <Button
              leftIcon={<GoTrash />}
              onClick={() => setSerialPortContent([])}
            >
              Clear
            </Button>
          </Flex>
        </VStack>
      </Flex>
    </DeviceContextProvider>
  );
};

export default ReplWindow;
