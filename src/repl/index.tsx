import { Button } from "@microbit/ui";
import { useRef, useState } from "react";
import { GoTrash } from "react-icons/go";
import { RiTerminalLine } from "react-icons/ri";
import { Flex, styled, VStack } from "styled-system/jsx";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { topBarHeight } from "../deployment/misc";

interface ReplProps {
  shown: boolean;
  onReplHide: () => void;
  minWidth: number;
}

/**
 * A Web Serial console for the connected CircuitPython device.
 */
const ReplWindow = ({ shown, onReplHide, minWidth }: ReplProps) => {
  const [serialPortContent, setSerialPortContent] = useState<string[]>([]);
  const contentRef = useRef<HTMLPreElement>(null);
  const [port, setPort] = useState<SerialPort | undefined>(undefined);
  const [reader, setReader] = useState<
    ReadableStreamDefaultReader<Uint8Array> | undefined
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
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }
          if (value) {
            const text = decoder.decode(value, { stream: true });
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
      setReader(undefined);
    }
  };

  return (
    <Flex
      flex="1 1 100%"
      flexDirection="column"
      height="100%"
      position="relative"
    >
      <Flex
        position="absolute"
        top="0"
        left="0"
        alignItems="center"
        zIndex="1"
        // Imported constant; not statically extractable.
        style={{ height: topBarHeight }}
      >
        <HideSplitViewButton
          aria-label="Hide REPL"
          onClick={onReplHide}
          splitViewShown={shown}
          direction="expandLeft"
          css={{ boxShadow: "md" }}
        />
      </Flex>
      <VStack bg="gray.25" height="100%" gap="0">
        <Flex
          width="100%"
          bg="white"
          boxShadow="0px 4px 16px #00000033"
          alignItems="center"
          justifyContent="center"
          pl="8"
          gap="4"
          style={{ height: topBarHeight }}
        >
          <Button
            onPress={!port ? handleConnect : handleDisconnect}
            startIcon={<RiTerminalLine />}
          >
            {!port ? "Connect" : "Disconnect"}
          </Button>
        </Flex>
        <styled.pre
          ref={contentRef}
          width="100%"
          flex="1"
          overflowY="scroll"
          pb="10"
          pt="5"
          px="5"
          fontFamily="mono"
          fontSize="sm"
          whiteSpace="pre-wrap"
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
          // Runtime value from the layout.
          style={{ minWidth }}
        >
          {serialPortContent.join("")}
        </styled.pre>
        <Flex
          px="5"
          py="6"
          width="100%"
          alignItems="center"
          justifyContent="end"
          bg="white"
        >
          <Button
            startIcon={<GoTrash />}
            onPress={() => setSerialPortContent([])}
          >
            Clear
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default ReplWindow;
