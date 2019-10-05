import json

from astropy.coordinates import SkyCoord
from astroquery.simbad import Simbad


constellations = [
    'UMa',
]

fields = ['name', 'ra', 'dec', 'plx', 'dist', 'vmag', 'ids', 'type']
fieldNames = {
    'name': 'MAIN_ID',
    'ra': 'RA',
    'dec': 'DEC',
    'plx': 'PLX_VALUE',
    'dist': 'Distance_distance',
    'dist_unit': 'Distance_unit',
    'vmag': 'FLUX_V',
    'ids': 'IDS',
    'type': 'OTYPE',
}

def queryConstellations(constellations=constellations, fields=fields):
    # https://astroquery.readthedocs.io/en/latest/api/astroquery.simbad.SimbadClass.html#astroquery.simbad.SimbadClass
    # Simbad.list_votable_fields()
    Simbad.add_votable_fields('distance', 'diameter', 'flux(V)', 'otype', 'ids', 'plx')
    Simbad.TIMEOUT = 10000
    Simbad.ROW_LIMIT = 10000

    for code in constellations:
        # queries all stars with name containing the constellation code
        # http://docs.astropy.org/en/stable/api/astropy.table.Table.html#astropy.table.Table
        stars = Simbad.query_object('* ' + code, wildcard=True)

        # Save to 'votable' or 'pandas.json'
        # https://docs.astropy.org/en/stable/io/unified.html#built-in-readers-writers
        stars.write('raw/' + code + '.json', format='pandas.json')

        data = None
        with open('raw/' + code + '.json') as target:
            data = data = json.load(target)

        stars = []
        starsMissingVmag = []
        for i, value in enumerate(data['MAIN_ID']):
            i = str(i)
            if data['FLUX_V'][i] is not None and data['FLUX_V'][i] > 6:
                continue
            star = {}
            for field in fields:
                if field is 'dist':
                    star['dist'] = {}
                    star['dist']['value'] = data[fieldNames[field]][i]
                    star['dist']['data-origin'] = 'HIP' if star['dist']['value'] is not None else None
                    star['dist']['unit'] = data[fieldNames['dist_unit']][i]
                else:
                    star[field] = data[fieldNames[field]][i]
            if star['vmag'] == None:
                starsMissingVmag.append(star)
            else:
                stars.append(star)

        stars = sorted(stars, key=lambda star: star['vmag'])
        with open('rawVisual/' + code + '.json', 'w') as output:
            output.write((
                '{\n  "stars": [\n    '
                + ',\n    '.join([json.dumps(star) for star in stars])
                + '\n  ],\n  "missingVmag": [\n    '
                + ',\n    '.join([json.dumps(star) for star in starsMissingVmag])
                + '\n  ]\n}'
            ))


# stars = Simbad.query_criteria('Vmag <= 6')
if __name__ == '__main__':
    queryConstellations()
