/**
 * Fleet Performance Component
 *
 * Fleet performance section with top/bottom drivers and vehicles
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FleetPerformance } from "@/lib/report-types";
import { formatConsumption, formatCurrency } from "@/lib/format-utils";
import { Trophy, TrendingDown } from "lucide-react";

interface FleetPerformanceProps {
  performance: FleetPerformance;
}

export function FleetPerformance({ performance }: FleetPerformanceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance de la Flotte</h2>
        <p className="text-muted-foreground">
          Classement des chauffeurs et véhicules
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top 5 Chauffeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead className="text-right">Trajets</TableHead>
                  <TableHead className="text-right">Conso.</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.topDrivers.map((driver, index) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          #{index + 1}
                        </span>
                        {driver.prenom} {driver.nom}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {driver.totalTrips}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatConsumption(driver.averageConsumption)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        {driver.efficiency}/100
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top 5 Véhicules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead className="text-right">Trajets</TableHead>
                  <TableHead className="text-right">Conso.</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.topVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          #{index + 1}
                        </span>
                        {vehicle.immatriculation}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {vehicle.totalTrips}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatConsumption(vehicle.averageConsumption)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-600">
                        {vehicle.efficiency}/100
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Performers */}
      {performance.bottomDrivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Chauffeurs à améliorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead className="text-right">Trajets</TableHead>
                  <TableHead className="text-right">Consommation</TableHead>
                  <TableHead className="text-right">Coût Total</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.bottomDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      {driver.prenom} {driver.nom}
                    </TableCell>
                    <TableCell className="text-right">
                      {driver.totalTrips}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatConsumption(driver.averageConsumption)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(driver.totalCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-orange-600">
                        {driver.efficiency}/100
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
