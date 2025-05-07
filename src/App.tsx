import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatText, parseNumber } from "./utils/text.util";

type FormValue = {
  initialInvestment: string;
  monthlyContribution?: string;
  lengthOfTime: string;
  interestRate: string;
};

type DataMonth = {
  month: number; // 1, 2, ..., 360
  year: number; // 1, 2, ..., 30
  invested: number; // Valor invertido acumulado al final del mes
  total: number; // Valor acumulado al final del mes
};

function App() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValue>({
    defaultValues: {
      initialInvestment: "",
      monthlyContribution: "",
      lengthOfTime: "",
      interestRate: "",
    },
  });
  const firstControlRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const [result, setResult] = useState<{
    data: DataMonth[];
    formValue: FormValue;
  } | null>(null);

  const returnData = result
    ? result.data.slice(-1)[0].total - result.data.slice(-1)[0].invested
    : null;
  const performanceData = result
    ? (returnData! * 100) / result.data.slice(-1)[0].invested
    : null;
  const graphData = result
    ? result.data
        .reduce((acc, item) => {
          const [lastItem, ...restItems] = acc;
          return lastItem?.year === item.year
            ? [item, ...restItems]
            : [item, ...acc];
        }, [] as DataMonth[])
        .reverse()
    : null;

  const calculate = (
    formValue: FormValue
  ): {
    data: DataMonth[];
    formValue: FormValue;
  } => {
    const months = +formValue.lengthOfTime * 12; // Total de meses
    const annualInterest = +formValue.interestRate / 100; // Interés anual
    const monthlyContribution = +(formValue.monthlyContribution ?? "0"); // Aporte mensual

    let total = +formValue.initialInvestment; // Monto inicial
    let invested = +formValue.initialInvestment; // Monto inicial
    const data: DataMonth[] = [
      {
        month: 0,
        year: 0,
        invested,
        total,
      },
    ];
    let initialYearAmount = total;

    for (let i = 1; i <= months; i++) {
      // Añadir el aporte mensual
      total += monthlyContribution;
      invested += monthlyContribution;

      // Aplicar el interés compuesto solo al final de cada año sobre el total acumulado el año anterior
      if (i % 12 === 0) {
        total = total + initialYearAmount * annualInterest;
        initialYearAmount = total;
      }

      // Guardar los datos de cada mes
      data.push({
        month: i,
        year: Math.ceil(i / 12), // Año correspondiente
        invested,
        total,
      });
    }

    return {
      data,
      formValue,
    };
  };

  const onSubmit = (formValue: FormValue) => {
    if (!isValid) return;

    setResult(calculate(formValue));
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleResetClick = () => {
    reset();
    setResult(null);
    firstControlRef.current?.focus();
  };

  return (
    <>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{
          py: 5,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          Compound Interest Calculator
        </Typography>

        {/* FORM */}
        <Card>
          <CardContent
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              paddingY: "24px !important",
            }}
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 2,
              }}
            >
              <TextField
                {...register("initialInvestment", {
                  required: "This field is required.",
                  min: {
                    value: 0,
                    message: "Value must be 0 or greater.",
                  },
                })}
                type="number"
                label="Initial Investment"
                placeholder="E.g. 1000"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                fullWidth
                autoFocus
                inputRef={firstControlRef}
                error={!!errors.initialInvestment?.message}
                helperText={errors.initialInvestment?.message || ""}
              />

              <TextField
                {...register("monthlyContribution", {
                  min: {
                    value: 0,
                    message: "Value must be 0 or greater.",
                  },
                })}
                type="number"
                label="Monthly Contribution"
                placeholder="E.g. 100"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                fullWidth
                error={!!errors.monthlyContribution?.message}
                helperText={errors.monthlyContribution?.message || ""}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 2,
              }}
            >
              <TextField
                {...register("interestRate", {
                  required: "This field is required.",
                })}
                type="number"
                label="Interest Rate in %"
                placeholder="E.g. 8"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                fullWidth
                error={!!errors.interestRate?.message}
                helperText={errors.interestRate?.message || ""}
              />

              <TextField
                {...register("lengthOfTime", {
                  required: "This field is required.",
                  min: {
                    value: 1,
                    message: "Value must be 1 or greater.",
                  },
                })}
                type="number"
                label="Length of Time in Years"
                placeholder="E.g. 30"
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                fullWidth
                error={!!errors.lengthOfTime?.message}
                helperText={errors.lengthOfTime?.message || ""}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                type="button"
                variant="outlined"
                color="primary"
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                }}
                onClick={handleResetClick}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  width: {
                    xs: "100%",
                    sm: "auto",
                  },
                }}
              >
                Calculate
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* RESULT */}
        {!!result && (
          <>
            {/* STATS */}
            <Typography
              variant="h4"
              component="h2"
              sx={{
                marginTop: 5,
                textAlign: "center",
              }}
              ref={resultRef}
            >
              In{" "}
              <Typography variant="inherit" fontWeight="bold" component="span">
                {result.formValue.lengthOfTime} years
              </Typography>{" "}
              you will have{" "}
              <Typography
                variant="h3"
                fontWeight="bold"
                component="div"
                color={result.data.slice(-1)[0].total > 0 ? "success" : "error"}
              >
                ${parseNumber(result.data.slice(-1)[0].total)}
              </Typography>
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 2,
                marginTop: 4,
              }}
            >
              <Card>
                <CardContent
                  sx={{
                    paddingY: "24px !important",
                  }}
                >
                  <Typography variant="h5" component="div">
                    Invested{" "}
                    <Typography
                      variant="inherit"
                      fontWeight="bold"
                      component="span"
                      color="success"
                    >
                      ${parseNumber(result.data.slice(-1)[0].invested)}
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent
                  sx={{
                    paddingY: "24px !important",
                  }}
                >
                  <Typography variant="h5" component="div">
                    Return{" "}
                    <Typography
                      variant="inherit"
                      fontWeight="bold"
                      component="span"
                      color={returnData! > 0 ? "success" : "error"}
                    >
                      ${parseNumber(returnData!)}
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent
                  sx={{
                    paddingY: "24px !important",
                  }}
                >
                  <Typography variant="h5" component="div">
                    Performance{" "}
                    <Typography
                      variant="inherit"
                      fontWeight="bold"
                      component="span"
                      color={performanceData! > 0 ? "success" : "error"}
                    >
                      {performanceData! > 0 && "+"}
                      {parseNumber(performanceData!)}%
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Graph */}
            <Card
              sx={{
                mt: 5,
              }}
            >
              <CardContent
                sx={{
                  paddingY: "24px !important",
                  width: "100%",
                  height: "500px",
                }}
              >
                <ResponsiveContainer>
                  <LineChart
                    data={graphData!}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(value) => `Year ${value}`}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) => (
                        <Typography variant="body1" component="span">
                          Year {label}
                        </Typography>
                      )}
                      formatter={(value, name) => [
                        `$${parseNumber(value as number)}`,
                        formatText(name as string, "capitalize"),
                      ]}
                      separator=": "
                    />
                    <Legend
                      formatter={(value: string) =>
                        formatText(value, "capitalize")
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="invested"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}

export default App;
