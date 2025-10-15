import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Paper, Text, Grid } from "@mantine/core";
import {
  IconDeviceDesktopCheck,
  IconArrowRight,
  IconFolderOpen,
  IconHourglass,
  IconX,
  IconMessageUser,
  IconCheck,
  IconListCheck,
  IconMailCheck,
} from "@tabler/icons-react";

export default function Index() {
  return (
    <AuthLayout>
      <Head>
        <title>Home</title>
      </Head>

      <div className="py-12">
        <div className="max-w mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-lg border sm:rounded-lg">
            <div className="p-6 text-gray-900 justify-center text-center">
              Mechanical Completion
            </div>
          </div>
        </div>
      </div>

      <div className="max-w mx-auto sm:px-6 lg:px-8">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #98edc2 0%, #79d1a5 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconDeviceDesktopCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>Checklist</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #e3e3e3 0%, #a1a1a1 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconFolderOpen
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>Open</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #1a4da2 0%, #0084f4 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconHourglass
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>Pending QC</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #c94747 0%, #d67a7a 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconX
                  size={30}
                  stroke={3}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>Rejected QC</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #1a4da2 0%, #0084f4 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>Approved QC</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>More Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(69.83deg, #0084f4 0%, #00c48c 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconMessageUser
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>Client Invitation</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>Mode Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(81.67deg, #fff2cc 0%, #e6c877 100%) ",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconListCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>RETURN WITH COMMENT BY CLIENT</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>Mode Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              p="xl"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                  content: "",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  background:
                    "linear-gradient(82.59deg, #84d194 0%, #47c462 100%)",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center" }}
                className="justify-center text-center"
              >
                <IconMailCheck
                  size={30}
                  stroke={1.5}
                  style={{ marginLeft: "8px", marginRight: "5px" }}
                />
                <span>APPROVED BY CLIENT & COMPLETED</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <span style={{ fontSize: "2em" }}>0</span>
              </div>

              <div
                className="justify-center text-center"
                style={{ marginTop: 30 }}
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <div
                    style={{ display: "flex", alignItems: "center" }}
                    className="justify-center text-center"
                  >
                    <span>Mode Detail</span>
                    <IconArrowRight size={20} stroke={1.5} />
                  </div>
                </a>
              </div>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </AuthLayout>
  );
}
